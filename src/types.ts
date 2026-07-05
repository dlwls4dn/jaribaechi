export interface ClassroomTheme {
  id: string;
  name: string;
  bg: string;
  boardBg: string;
  boardBorder: string;
  boardText: string;
  cardBg: string;
  cardText: string;
  cardBorder: string;
  cardHover: string;
  fixedBg: string;
  fixedText: string;
  selectedBg: string;
  controlBg: string;
  accentBg: string;
  accentText: string;
  buttonBg: string;
  emptyBg: string;
}

export interface Student {
  id: string;
  name: string;
  isFixed?: boolean; // If true, this student's seat won't be shuffled
}

export interface Seat {
  id: string; // "seat-0", "seat-1", etc.
  row: number;
  col: number;
  groupId: 'left' | 'center' | 'right' | 'none'; // group for pair mode
  studentId: string | null; // Student assigned to this seat
}

export type LayoutMode = 'individual' | 'pair';

export interface SavedPlan {
  id: string;
  name: string;
  date: string;
  mode: LayoutMode;
  assignments: { [seatId: string]: string | null }; // seatId -> studentId
}
