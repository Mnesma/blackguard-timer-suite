export type ParserState = {
    result: any;
    offset: number;
    source: string;
};

export type Transformer = (initialState: ParserState) => ParserState;

class ParseError extends Error {
    public message: string;

    constructor(message: string, state: ParserState) {
        super();
        const { offset, source } = state;

        const { targetLine, lineNumber, lineOffset } = this.getTargetLine(
            source,
            offset
        );

        const lineNumberSeperatorSpacing = 3;

        this.message = message + "\n"
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
            if (currentOffset > offset) {
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

    constructor(transformer: Transformer | Transformer[]) {
        if (Array.isArray(transformer)) {
            this.transforms.push(...transformer);
        } else {
            this.transforms.push(transformer);
        }
    }

    public clone(): Parser {
        return new Parser(this.transforms);
    }

    public parse(initialState: ParserState): ParserState;
    public parse(source: string): ParserState;
    public parse(sourceOrState: ParserState | string): ParserState {
        if (typeof sourceOrState === "string") {
            return this.parseWithState({
                offset: 0,
                result: null,
                source: sourceOrState
            });
        }

        return this.parseWithState(sourceOrState);
    }

    public map(callback: (result: any) => any): this {
        this.transforms.push((initialState: ParserState) => {
            return {
                ...initialState,
                result: callback(initialState.result)
            };
        });

        return this;
    }

    public dispose(): this {
        this.map(() => null);
        return this;
    }

    private parseWithState(state: ParserState): ParserState {
        let nextState = state;

        for (const transform of this.transforms) {
            nextState = transform(nextState);
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
                    result: literal
                };
            } else {
                throw new ParseError(
                    `Could not find pattern: "${literal}"`,
                    initialState
                );
            }
        }

        const matches = target.match(literal);

        if (matches) {
            const result = matches[0];
            return {
                ...initialState,
                offset: offset + result.length,
                result
            };
        }

        throw new ParseError(
            `Could not find pattern: "${literal}"`,
            initialState
        );
    });

export const sequence = (...parsers: Parser[]) =>
    new Parser((initialState) => {
        const result = [];
        let nextState = initialState;

        for (const parser of parsers) {
            nextState = parser.parse(nextState);
            result.push(nextState.result);
        }

        return {
            ...nextState,
            result
        };
    });

export const maybe = (parser: Parser) =>
    new Parser((initialState) => {
        try {
            return parser.parse(initialState);
        } catch {
            return {
                ...initialState,
                result: null
            };
        }
    });

export const some = (parser: Parser) =>
    new Parser((initialState) => {
        let nextState = parser.parse(initialState);
        const result = [nextState.result];

        try {
            while (nextState = parser.parse(nextState)) {
                result.push(nextState.result);
            }
        } finally {
            return {
                ...nextState,
                result
            };
        }
    });

export const choice = (...parsers: Parser[]) =>
    new Parser((initialState) => {
        for (const parser of parsers) {
            try {
                return parser.parse(initialState);
            } catch {}
        }

        throw new ParseError("No valid choice provided", initialState);
    });

export const seperated = (tokenParser: Parser, seperatorParser: Parser) =>
    new Parser((initialState) => {
        const result = [];
        let nextState = initialState;
        try {
            while (nextState = tokenParser.parse(nextState)) {
                result.push(nextState.result);
                nextState = seperatorParser.parse(nextState);
            }
        } finally {
            return {
                ...nextState,
                result
            };
        }
    });

export const trim = (parser: Parser) =>
    new Parser((initialState) => {
        const newState = parser.parse(initialState);

        if (typeof newState.result === "string") {
            newState.result = newState.result.trim();
        }

        return newState;
    });

export const join = (seperator: string, ...parsers: Parser[]) =>
    new Parser((initialState) => {
        const newState = sequence(...parsers).parse(initialState);

        if (Array.isArray(newState.result)) {
            newState.result = newState.result.join(seperator);
        }

        return newState;
    });

export const compact = (...parsers: Parser[]) =>
    new Parser((initialState) => {
        const newState = sequence(...parsers).parse(initialState);
        const results: any[] = [];

        if (Array.isArray(newState.result)) {
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
    try {
        return literal(lettersRegex).parse(initialState);
    } catch {
        throw new ParseError("Invalid letters", initialState);
    }
});

const digitRegex = /^[0-9]{1}/;
export const digit = new Parser((initialState) => {
    try {
        return literal(digitRegex).parse(initialState);
    } catch {
        throw new ParseError("Invalid digit", initialState);
    }
});

const digitsRegex = /^[0-9]+/;
export const digits = new Parser((initialState) => {
    try {
        return literal(digitsRegex).parse(initialState);
    } catch {
        throw new ParseError("Invalid digits", initialState);
    }
});

const lineBreaksRegex = /^(\r\n|\r|\n)+/;
export const lineBreaks = new Parser((initialState) => {
    try {
        return literal(lineBreaksRegex).parse(initialState);
    } catch {
        throw new ParseError("Invalid line break", initialState);
    }
});

const whiteSpacesRegex = /^\s+/;
export const whiteSpaces = new Parser((initialState) => {
    try {
        return literal(whiteSpacesRegex).parse(initialState);
    } catch {
        throw new ParseError("Invalid white space", initialState);
    }
});

export const end = new Parser((initialState) => {
    const { offset, source } = initialState;
    const target = source.slice(offset);

    if (target === "") {
        return {
            ...initialState,
            result: null
        };
    }

    throw new ParseError("Expected end of input", initialState);
});
