import { minute, second } from "../shared/constants";
import {
    branch,
    choice,
    compact,
    end,
    flatten,
    join,
    lineBreaks,
    literal,
    maybe,
    required,
    seperated,
    sequence,
    some,
    Tag,
    tag,
    toNumber,
    trim,
    whiteSpaces
} from "./parser-combinators";

const titleTag = Symbol("title");
const keyBindingTag = Symbol("keyBinding");
const countdownTag = Symbol("countdown");
const timeTag = Symbol("time");

type PrimitiveValue = string | number | (string | number)[];

export type ParsedBgscript = {
    title: string;
    countdowns: PrimitiveValue[][];
    keyBindings: PrimitiveValue[][];
};

type BgscriptTag = { tag: symbol; value: PrimitiveValue[]; };

class Primitive {
    static Text = literal(/^[^\s(),:]+/);

    static Name = literal(/^([^\s(),]|( |\t))+/);

    static Spacing = literal(/^( |\t)+/);

    static Indent = literal(/^( ){4}|\t/).dispose();

    static Time = sequence(
        literal(/^[0-9]{1,2}/).map(toNumber),
        join(
            "",
            literal(":").dispose(),
            literal(/^[0-9]{2}/)
        ).map(toNumber)
    )
        .map(([minutes, seconds]) => (minutes * minute + seconds * second))
        .map(tag(timeTag));
}

const GenericAction = compact(
    Primitive.Text.onFail("An action must have a valid method"),
    maybe(
        sequence(
            Primitive.Spacing.dispose().onFail(
                "Expected spacing between method and parameters"
            ),
            seperated(
                Primitive.Text,
                Primitive.Spacing
            )
        )
    ),
    maybe(Primitive.Spacing).dispose(),
    choice(
        lineBreaks.dispose(),
        end
    ).onFail("Expected line break or end of file")
)
    .map(([method, params]) => ({
        method,
        params
    }));

class KeyBinding {
    static Operator = literal("#").dispose();

    static Definition = compact(
        Primitive.Spacing.dispose().onFail(
            "Expected spacing operator and key code"
        ),
        Primitive.Text.onFail("Invalid key code"),
        Primitive.Spacing.dispose().onFail(
            "Expected spacing between key code and binding name"
        ),
        trim(Primitive.Name).onFail("Invalid key binding name"),
        maybe(Primitive.Spacing).dispose(),
        lineBreaks.dispose().onFail("Expected line break")
    )
        .map(([key, name]) => ({
            key,
            name
        }));

    static Parser = flatten(compact(
        KeyBinding.Operator,
        required(sequence(
            KeyBinding.Definition,
            some(branch(
                Primitive.Indent,
                required(GenericAction)
            )).onFail("Could not find key binding actions")
        ))
    ))
        .map(([definition, actions]) => ({ definition, actions }))
        .map(tag<BgscriptTag>(keyBindingTag));
}

class Countdown {
    static Operator = literal(">").dispose();

    static ActionOperator = literal("@");

    static Definition = compact(
        Primitive.Spacing.dispose().onFail(
            "Expected spacing between operator and countdown name"
        ),
        Primitive.Text.onFail("Invalid countdown name"),
        maybe(Primitive.Spacing).dispose(),
        lineBreaks.dispose().onFail("Expected line break")
    )
        .map(([name]) => ({ name }));

    static Action = compact(
        Primitive.Spacing.dispose().onFail(
            "Expected spacing between operator and time"
        ),
        choice(
            Primitive.Time,
            Primitive.Text
        ).onFail("Invalid time value"),
        Primitive.Spacing.dispose().onFail(
            "Expected spacing between time and method"
        ),
        Primitive.Text.onFail("An action must have a valid method"),
        maybe(Primitive.Spacing).dispose(),
        seperated(
            Primitive.Text,
            Primitive.Spacing
        ),
        maybe(Primitive.Spacing).dispose(),
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

    static Parser = flatten(compact(
        Countdown.Operator,
        required(sequence(
            Countdown.Definition,
            some(
                branch(
                    sequence(
                        Primitive.Indent,
                        Countdown.ActionOperator
                    ),
                    required(Countdown.Action)
                )
            ).onFail("Could not find countdown actions")
        ))
    ))
        .map(([definition, actions]) => ({ definition, actions }))
        .map(tag<BgscriptTag>(countdownTag));
}

export class Bgscript {
    static Parser = compact(
        maybe(whiteSpaces).dispose(),
        trim(Primitive.Name).map(tag<BgscriptTag>(titleTag)).onFail(
            "A valid title is required"
        ),
        maybe(whiteSpaces).dispose(),
        seperated(
            choice(
                KeyBinding.Parser,
                Countdown.Parser
            ),
            maybe(whiteSpaces)
        )
    )
        .map(([title, body]: [string, BgscriptTag[]]) => {
            const parsedScript: ParsedBgscript = {
                title,
                countdowns: [],
                keyBindings: []
            };

            for (const block of body) {
                switch (block.tag) {
                    case countdownTag:
                        parsedScript.countdowns.push(block.value);
                        break;
                    case keyBindingTag:
                        parsedScript.keyBindings.push(block.value);
                        break;
                }
            }

            return parsedScript;
        });
}
