namespace glift.color {
  export enum Color {
    BLACK = 'BLACK',
    WHITE = 'WHITE',
    EMPTY = 'EMPTY',
  }

  export function opposite(color: Color): Color {
    if (color === Color.BLACK) return Color.WHITE;
    if (color === Color.WHITE) return Color.BLACK;
    else return color;
  }
}
