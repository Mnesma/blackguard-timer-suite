import {
    choice,
    compact,
    digit,
    end,
    join,
    letters,
    lineBreaks,
    literal,
    maybe,
    seperated,
    sequence,
    some,
    trim,
    whiteSpaces
} from "./parsege";

const Title = Symbol("Title");
const KeyBinding = Symbol("KeyBinding");
const Variable = Symbol("Variable");
const Step = Symbol("Step");
const Widget = Symbol("Widget");

const List = Symbol("List");
const Time = Symbol("Time");

const tag = (tag: symbol) => (result: any) => ({
    tag,
    value: result
});

const toNumber = (result: any) => Number(result);

const text = literal(/^[^\s(),]+/);

const spacing = literal(/^( |\t)+/);

const indent = literal(/^( ){4}|\t/).dispose();

const name = literal(/^([^\s(),]|( |\t))+/);

const time = sequence(
    join(
        "",
        digit,
        maybe(digit)
    ).map(toNumber),
    join(
        "",
        literal(":").dispose(),
        digit,
        digit
    ).map(toNumber)
)
    .map(([minutes, seconds]) => (minutes * 60 * 1000 + seconds * 1000))
    .map(tag(Time));

const actionParser = compact(
    indent.dispose(),
    text,
    maybe(spacing).dispose(),
    seperated(
        text,
        spacing
    ),
    maybe(spacing).dispose(),
    choice(
        lineBreaks.dispose(),
        end
    )
)
    .map(([method, params]) => ({
        method,
        params
    }));

const keyBindingDefinitionParser = compact(
    literal("#").dispose(),
    spacing.dispose(),
    text,
    spacing.dispose(),
    trim(name),
    maybe(spacing).dispose(),
    lineBreaks.dispose()
)
    .map(([key, name]) => ({
        key,
        name
    }));

const keyBindingParser = sequence(
    keyBindingDefinitionParser,
    some(actionParser)
)
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

const variableParser = compact(
    literal("$").dispose(),
    spacing.dispose(),
    text,
    spacing.dispose(),
    choice(
        time,
        list,
        text
    ),
    maybe(spacing).dispose(),
    choice(
        lineBreaks.dispose(),
        end
    )
)
    .map(([name, value]) => ({ name, value }))
    .map(tag(Variable));

const stepDefinitionParser = compact(
    literal(">").dispose(),
    spacing.dispose(),
    text,
    maybe(spacing).dispose(),
    lineBreaks.dispose()
)
    .map(([name]) => ({ name }));

const stepActionParser = compact(
    indent.dispose(),
    literal("@"),
    spacing.dispose(),
    choice(
        time,
        text
    ),
    spacing.dispose(),
    seperated(
        text,
        spacing
    ),
    maybe(spacing).dispose(),
    choice(
        lineBreaks.dispose(),
        end
    )
)
    .map(([method, time, params]) => ({
        method,
        time,
        params
    }));

const stepParser = sequence(
    stepDefinitionParser,
    some(stepActionParser)
)
    .map(([definition, actions]) => ({ definition, actions }))
    .map(tag(Step));

const widgetDefinitionParser = compact(
    literal("&").dispose(),
    spacing.dispose(),
    text,
    maybe(spacing).dispose(),
    lineBreaks.dispose()
)
    .map(([name]) => ({ name }));

const widgetParser = sequence(
    widgetDefinitionParser,
    some(actionParser)
)
    .map(([definition, actions]) => ({ definition, actions }))
    .map(tag(Widget));

const bgscriptParser = compact(
    maybe(whiteSpaces).dispose(),
    trim(name).map(tag(Title)),
    maybe(whiteSpaces).dispose(),
    seperated(
        choice(
            keyBindingParser,
            variableParser,
            stepParser,
            widgetParser
        ),
        maybe(whiteSpaces)
    )
)
    .map(([title, body]) => ({ title, body }));

const sample = `



Title

# key binding name
    action
    action param
    action param param

$ variableName value

& widgetName
    key value
    key value value

> timer1
    @ 1:30 reset
    @ () goTo timer2

> timer2
    @ 0:00 markUrgent
    @ 0:30 reset
    @ 0:30 goTo timer1`;

const timer = bgscriptParser.parse(sample);
console.log(timer.result.body[3].value.actions);
