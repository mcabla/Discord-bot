export class STRING{
    public static readonly LETTERS = /[a-zA-Z]/g;

    public static isNumber(value: string | number): boolean {
        return ((value != null) &&
            (value !== '') &&
            /^\d+$/.test(value.toString()));
    }
}