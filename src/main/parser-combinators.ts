export enum StateStatus {
    Good = "good",
    Bad = "bad",
    Fatal = "fatal"
}

export type ParserState = {
    result: any;
    offset: number;
    source: string;
    status: StateStatus;
    error: ParseError | null;
};

export type Tag = { tag: symbol; value: any; };

export type Transformer = (initialState: ParserState) => ParserState;

class ParseError extends Error {
    constructor(public description: string, private state: ParserState) {
        super();
    }

    public get message(): string {
        const { offset, source } = this.state;

        const { targetLine, lineNumber, lineOffset } = this.getTargetLine(
            source,
            offset
        );

        const lineNumberSeperatorSpacing = 3;

        return this.description + "\n"
            + `${lineNumber} | ${targetLine}` + "\n"
            + "^".padStart(
                lineOffset + `${lineNumber}`.length
                    + lineNumberSeperatorSpacing + 1
            );
    }

    private getTargetLine(
        source: string,
        offset: number
    ): { targetLine: string; lineNumber: number; lineOffset: number; } {
        const lines = source.split(/(\r\n|\r|\n)/);

        let currentOffset = 0;
        let lineNumber = 0;
        let targetLine: string | null = null;
        for (const line of lines) {
            currentOffset += line.length;
            if (currentOffset >= offset) {
                targetLine = line;
                break;
            }
            lineNumber++;
        }

        if (targetLine === null) {
            throw new Error("Failed to find invalid line");
        }

        return {
            targetLine,
            lineNumber,
            lineOffset: targetLine.length - (currentOffset - offset)
        };
    }
}

export class Parser {
    private transforms: Transformer[] = [];
    private onFailTransformer: Transformer | null = null;

    constructor(
        transformer: Transformer | Transformer[],
        onFail?: Transformer
    ) {
        if (Array.isArray(transformer)) {
            this.transforms.push(...transformer);
        } else {
            this.transforms.push(transformer);
        }

        if (onFail) {
            this.onFailTransformer = onFail;
        }
    }

    public parse(initialState: ParserState): ParserState;
    public parse(source: string): ParserState;
    public parse(sourceOrState: ParserState | string): ParserState {
        if (typeof sourceOrState === "string") {
            return this.parseWithState({
                offset: 0,
                result: null,
                source: sourceOrState,
                status: StateStatus.Good,
                error: null
            });
        }

        return this.parseWithState(sourceOrState);
    }

    public map(callback: (result: any) => any): Parser {
        return new Parser([
            ...this.transforms,
            (initialState: ParserState) => {
                if (initialState.status !== StateStatus.Good) {
                    return initialState;
                }

                return {
                    ...initialState,
                    result: callback(initialState.result)
                };
            }
        ]);
    }

    public dispose(): Parser {
        return this.map(() => null);
    }

    public onFail(
        newErrorMessage: string | ((state: ParserState) => string)
    ): Parser {
        return new Parser(this.transforms, (state) => {
            if (state.error === null || state.status === StateStatus.Good) {
                return state;
            }

            if (typeof newErrorMessage === "string") {
                state.error.description = newErrorMessage;
            } else {
                state.error.description = newErrorMessage(state);
            }

            return state;
        });
    }

    private parseWithState(state: ParserState): ParserState {
        let nextState = state;

        for (const transform of this.transforms) {
            nextState = transform(nextState);
        }

        if (this.onFailTransformer) {
            nextState = this.onFailTransformer(nextState);
        }

        if (nextState.status === StateStatus.Fatal) {
            throw nextState.error;
        }

        return nextState;
    }
}

export const literal = (literal: string | RegExp) =>
    new Parser((initialState) => {
        const { offset, source } = initialState;
        const target = source.slice(offset);

        if (typeof literal === "string") {
            if (target.startsWith(literal)) {
                return {
                    ...initialState,
                    offset: offset + literal.length,
                    result: literal,
                    status: StateStatus.Good,
                    error: null
                };
            } else {
                return {
                    ...initialState,
                    result: null,
                    status: StateStatus.Bad,
                    error: new ParseError(
                        `Could not find pattern: "${literal}"`,
                        initialState
                    )
                };
            }
        }

        const matches = target.match(literal);

        if (matches) {
            const result = matches[0];
            return {
                ...initialState,
                offset: offset + result.length,
                result,
                status: StateStatus.Good,
                error: null
            };
        }

        return {
            ...initialState,
            status: StateStatus.Bad,
            result: null,
            error: new ParseError(
                `Could not find pattern: "${literal}"`,
                initialState
            )
        };
    });

export const has = (literal: string | RegExp) =>
    new Parser((initialState) => {
        const { offset, source } = initialState;
        const target = source.slice(offset);

        if (typeof literal === "string") {
            if (target.startsWith(literal)) {
                return {
                    ...initialState,
                    result: literal,
                    status: StateStatus.Good,
                    error: null
                };
            } else {
                return {
                    ...initialState,
                    result: null,
                    status: StateStatus.Bad,
                    error: new ParseError(
                        `Could not find pattern: "${literal}"`,
                        initialState
                    )
                };
            }
        }

        const matches = target.match(literal);

        if (matches) {
            const result = matches[0];
            return {
                ...initialState,
                result,
                status: StateStatus.Good,
                error: null
            };
        }

        return {
            ...initialState,
            status: StateStatus.Bad,
            result: null,
            error: new ParseError(
                `Could not find pattern: "${literal}"`,
                initialState
            )
        };
    });

export const sequence = (...parsers: Parser[]) =>
    new Parser((initialState) => {
        const result = [];
        let nextState = initialState;

        for (const parser of parsers) {
            nextState = parser.parse(nextState);

            if (nextState.status === StateStatus.Good) {
                result.push(nextState.result);
            } else {
                return nextState;
            }
        }

        return {
            ...nextState,
            result,
            status: StateStatus.Good,
            error: null
        };
    });

export const maybe = (parser: Parser) =>
    new Parser((initialState) => {
        const nextState = parser.parse(initialState);

        return {
            ...nextState,
            status: StateStatus.Good,
            error: null
        };
    });

export const some = (parser: Parser) =>
    new Parser((initialState) => {
        let nextState = initialState;
        const result = [];

        while (true) {
            nextState = parser.parse(nextState);

            if (nextState.status === StateStatus.Good) {
                result.push(nextState.result);
            } else {
                break;
            }
        }

        if (result.length === 0) {
            return {
                ...nextState,
                result: null,
                status: StateStatus.Bad,
                error: new ParseError(
                    `Could not find some ${parser}`,
                    nextState
                )
            };
        }

        return {
            ...nextState,
            result,
            status: StateStatus.Good,
            error: null
        };
    });

export const choice = (...parsers: Parser[]) =>
    new Parser((initialState) => {
        for (const parser of parsers) {
            const newState = parser.parse(initialState);

            if (newState.status === StateStatus.Good) {
                return newState;
            }
        }

        return {
            ...initialState,
            result: null,
            status: StateStatus.Bad,
            error: new ParseError("No valid choice provided", initialState)
        };
    });

export const seperated = (tokenParser: Parser, seperatorParser: Parser) =>
    new Parser((initialState) => {
        const result = [];
        let nextState = initialState;

        while (true) {
            nextState = tokenParser.parse(nextState);

            if (nextState.status === StateStatus.Good) {
                result.push(nextState.result);
            } else {
                break;
            }

            nextState = seperatorParser.parse(nextState);

            if (nextState.status === StateStatus.Bad) {
                break;
            }
        }

        return {
            ...nextState,
            result,
            status: StateStatus.Good,
            error: null
        };
    });

export const trim = (parser: Parser) =>
    new Parser((initialState) => {
        const newState = parser.parse(initialState);

        if (
            newState.status === StateStatus.Good
            && typeof newState.result === "string"
        ) {
            newState.result = newState.result.trim();
        }

        return newState;
    });

export const join = (seperator: string, ...parsers: Parser[]) =>
    new Parser((initialState) => {
        const newState = sequence(...parsers).parse(initialState);

        if (
            newState.status === StateStatus.Good
            && Array.isArray(newState.result)
        ) {
            newState.result = newState.result.join(seperator);
        }

        return newState;
    });

export const flatten = (parser: Parser) =>
    new Parser((initialState) => {
        const newState = parser.parse(initialState);

        if (newState.status === StateStatus.Good) {
            newState.result = [newState.result].flat(Infinity);
        }

        return newState;
    });

export const compact = (...parsers: Parser[]) =>
    new Parser((initialState) => {
        const newState = sequence(...parsers).parse(initialState);
        const results: any[] = [];

        if (
            newState.status === StateStatus.Good
            && Array.isArray(newState.result)
        ) {
            for (const result of newState.result) {
                if (!!result) {
                    results.push(result);
                }
            }
        } else {
            return newState;
        }

        return {
            ...newState,
            result: results
        };
    });

export const required = (parser: Parser) =>
    new Parser((initialState) => {
        const newState = parser.parse(initialState);

        if (newState.status === StateStatus.Bad) {
            return {
                ...newState,
                status: StateStatus.Fatal
            };
        }

        return newState;
    });

export const branch = (
    condition: Parser,
    trueBranch: Parser,
    falseBranch?: Parser
) => new Parser((initialState) => {
    let nextState = condition.parse(initialState);
    const passes = nextState.status === StateStatus.Good;

    if (passes) {
        return trueBranch.parse(nextState);
    } else if (falseBranch) {
        return falseBranch.parse(initialState);
    }

    return {
        ...initialState,
        result: null,
        status: StateStatus.Bad,
        error: new ParseError("No false branch provided", initialState)
    };
});

const letterRegex = /^[a-zA-Z]{1}/;
export const letter = new Parser((initialState) => {
    try {
        return literal(letterRegex).parse(initialState);
    } catch {
        throw new ParseError("Invalid letter", initialState);
    }
});

const lettersRegex = /^[a-zA-Z]+/;
export const letters = new Parser((initialState) => {
    const newState = literal(lettersRegex).parse(initialState);

    if (newState.status === StateStatus.Bad) {
        return {
            ...newState,
            error: new ParseError("Invalid letters", initialState)
        };
    }

    return newState;
});

const digitRegex = /^[0-9]{1}/;
export const digit = new Parser((initialState) => {
    const newState = literal(digitRegex).parse(initialState);

    if (newState.status === StateStatus.Bad) {
        return {
            ...newState,
            error: new ParseError("Invalid digit", initialState)
        };
    }

    return newState;
});

const digitsRegex = /^[0-9]+/;
export const digits = new Parser((initialState) => {
    const newState = literal(digitsRegex).parse(initialState);

    if (newState.status === StateStatus.Bad) {
        return {
            ...newState,
            error: new ParseError("Invalid digits", initialState)
        };
    }

    return newState;
});

const lineBreaksRegex = /^(\r\n|\r|\n)+/;
export const lineBreaks = new Parser((initialState) => {
    const newState = literal(lineBreaksRegex).parse(initialState);

    if (newState.status === StateStatus.Bad) {
        return {
            ...newState,
            error: new ParseError("Invalid line breaks", initialState)
        };
    }

    return newState;
});

const whiteSpacesRegex = /^\s+/;
export const whiteSpaces = new Parser((initialState) => {
    const newState = literal(whiteSpacesRegex).parse(initialState);

    if (newState.status === StateStatus.Bad) {
        return {
            ...newState,
            error: new ParseError("Invalid white spaces", initialState)
        };
    }

    return newState;
});

export const end = new Parser((initialState) => {
    const { offset, source } = initialState;
    const target = source.slice(offset);

    if (target === "") {
        return {
            ...initialState,
            result: null,
            error: null,
            status: StateStatus.Good
        };
    }

    return {
        ...initialState,
        result: null,
        error: new ParseError("Expected end of input", initialState),
        status: StateStatus.Bad
    };
});

export const toNumber = (result: any) => Number(result);

export const tag = <T = Tag>(tag: symbol) => (result: any): T => ({
    tag,
    value: result
} as T);
