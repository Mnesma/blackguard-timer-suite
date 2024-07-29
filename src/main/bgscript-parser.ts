import {
    branch,
    choice,
    compact,
    end,
    flatten,
    join,
    letters,
    lineBreaks,
    literal,
    maybe,
    required,
    seperated,
    sequence,
    some,
    trim,
    whiteSpaces
} from "./base-parser-combinators";

const Title = Symbol("Title");
const KeyBinding = Symbol("KeyBinding");
const Variable = Symbol("Variable");
const Countdown = Symbol("Countdown");
const Widget = Symbol("Widget");

const List = Symbol("List");
const Time = Symbol("Time");

const tag = (tag: symbol) => (result: any) => ({
    tag,
    value: result
});

const toNumber = (result: any) => Number(result);

const text = literal(/^[^\s(),:]+/);

const spacing = literal(/^( |\t)+/);

const indent = literal(/^( ){4}|\t/).dispose();

const name = literal(/^([^\s(),]|( |\t))+/);

const twoDigets = literal(/^[0-9]{2}/);
const oneOrTwoDigets = literal(/^[0-9]{1,2}/);

const time = sequence(
    oneOrTwoDigets.map(toNumber),
    join(
        "",
        literal(":").dispose(),
        twoDigets
    ).map(toNumber)
)
    .map(([minutes, seconds]) => (minutes * 60 * 1000 + seconds * 1000))
    .map(tag(Time));

const actionParser = compact(
    text.onFail("An action must have a valid method"),
    maybe(
        sequence(
            spacing.dispose().onFail(
                "Expected spacing between method and parameters"
            ),
            seperated(
                text,
                spacing
            )
        )
    ),
    maybe(spacing).dispose(),
    choice(
        lineBreaks.dispose(),
        end
    ).onFail("Expected line break or end of file")
)
    .map(([method, params]) => ({
        method,
        params
    }));

const keyBindingDefinitionParser = compact(
    spacing.dispose().onFail("Expected spacing operator and key code"),
    text.onFail("Invalid key code"),
    spacing.dispose().onFail(
        "Expected spacing between key code and binding name"
    ),
    trim(name).onFail("Invalid key binding name"),
    maybe(spacing).dispose(),
    lineBreaks.dispose().onFail("Expected line break")
)
    .map(([key, name]) => ({
        key,
        name
    }));

const keyBindingParser = flatten(compact(
    literal("#").dispose(),
    required(sequence(
        keyBindingDefinitionParser,
        some(
            branch(
                indent,
                required(actionParser)
            )
        ).onFail("Could not find key binding actions")
    ))
))
    .map(([definition, actions]) => ({ definition, actions }))
    .map(tag(KeyBinding));

const list = compact(
    literal("(").dispose(),
    maybe(spacing).dispose(),
    seperated(
        letters,
        sequence(
            maybe(spacing),
            literal(","),
            maybe(spacing)
        )
    ),
    maybe(spacing).dispose(),
    literal(")").dispose()
).map(tag(List));

const variableParser = flatten(compact(
    literal("$").dispose(),
    required(sequence(
        spacing.dispose().onFail(
            "Expected spacing between operator and variable name"
        ),
        text.onFail("Invalid variable name"),
        spacing.dispose().onFail(
            "Expected spacing between variable name and variable value"
        ),
        choice(
            time,
            list,
            text
        ).onFail("Invalid variable value"),
        maybe(spacing).dispose(),
        choice(
            lineBreaks.dispose(),
            end
        ).onFail("Expected line break or end of file")
    ))
))
    .map(([name, value]) => ({ name, value }))
    .map(tag(Variable));

const countdownDefinitionParser = compact(
    spacing.dispose().onFail(
        "Expected spacing between operator and countdown name"
    ),
    text.onFail("Invalid countdown name"),
    maybe(spacing).dispose(),
    lineBreaks.dispose().onFail("Expected line break")
)
    .map(([name]) => ({ name }));

const countdownActionParser = compact(
    spacing.dispose().onFail("Expected spacing between operator and time"),
    choice(
        time,
        text
    ).onFail("Invalid time value"),
    spacing.dispose().onFail("Expected spacing between time and method"),
    text.onFail("An action must have a valid method"),
    maybe(spacing).dispose(),
    seperated(
        text,
        spacing
    ),
    maybe(spacing).dispose(),
    choice(
        lineBreaks.dispose(),
        end
    ).onFail("Expected line break or end of file")
)
    .map(([method, time, params]) => ({
        method,
        time,
        params
    }));

const countdownParser = flatten(compact(
    literal(">").dispose(),
    required(sequence(
        countdownDefinitionParser,
        some(
            branch(
                sequence(
                    indent,
                    literal("@")
                ),
                required(countdownActionParser)
            )
        ).onFail("Could not find countdown actions")
    ))
))
    .map(([definition, actions]) => ({ definition, actions }))
    .map(tag(Countdown));

const widgetDefinitionParser = compact(
    spacing.dispose().onFail(
        "Expected spacing between operator and widget name"
    ),
    text.onFail("Invalid widget name"),
    maybe(spacing).dispose(),
    lineBreaks.dispose().onFail("Expected line break")
)
    .map(([name]) => ({ name }));

const widgetParser = flatten(compact(
    literal("&").dispose(),
    required(sequence(
        widgetDefinitionParser,
        some(
            branch(
                indent,
                required(actionParser)
            )
        ).onFail("Could not find widget actions")
    ))
))
    .map(([definition, actions]) => ({ definition, actions }))
    .map(tag(Widget));

export const bgscriptParser = compact(
    maybe(whiteSpaces).dispose(),
    trim(name).map(tag(Title)).onFail("A valid title is required"),
    maybe(whiteSpaces).dispose(),
    seperated(
        choice(
            keyBindingParser,
            variableParser,
            countdownParser,
            widgetParser
        ),
        maybe(whiteSpaces)
    )
)
    .map(([title, body]) => ({ title, body }));

// const sample = `

// Title

// # key bindingName
//     action
//     action param
//     action param param

// $ variableName value

// & widgetName
//     key value
//     key value value

// > timer1
//     @ 1:30 reset
//     @ 2:00 goTo timer2

// > timer2
//     @ :00 markUrgent
//     @ 0:30 reset
//     @ 0:30 goTo timer1`;

// console.log("Making timer");
// const timer = bgscriptParser.parse(sample);
// console.log("Done making timer");
// console.log("timer:", timer);
