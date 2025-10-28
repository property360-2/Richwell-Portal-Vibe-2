export const AllowedGrades = [
  '1.0',
  '1.25',
  '1.5',
  '1.75',
  '2.0',
  '2.25',
  '2.5',
  '2.75',
  '3.0',
  '4.0',
  '5.0',
  'INC',
  'DRP'
];

const gradeMapToEnum = {
  '1.0': '1_0',
  '1.25': '1_25',
  '1.5': '1_5',
  '1.75': '1_75',
  '2.0': '2_0',
  '2.25': '2_25',
  '2.5': '2_5',
  '2.75': '2_75',
  '3.0': '3_0',
  '4.0': '4_0',
  '5.0': '5_0',
  INC: 'INC',
  DRP: 'DRP'
};

// Prisma enums cannot start with a number; schema uses _x_y identifiers.
// Convert a human grade string to the Prisma enum value.
export function gradeStringToEnumValue(grade) {
  if (grade === 'INC' || grade === 'DRP') return grade;
  const key = gradeMapToEnum[grade];
  return key ? `G${key}` : null;
}

const enumToStringMap = {
  G1_0: '1.0',
  G1_25: '1.25',
  G1_5: '1.5',
  G1_75: '1.75',
  G2_0: '2.0',
  G2_25: '2.25',
  G2_5: '2.5',
  G2_75: '2.75',
  G3_0: '3.0',
  G4_0: '4.0',
  G5_0: '5.0',
  INC: 'INC',
  DRP: 'DRP'
};

export function gradeEnumToString(enumVal) {
  return enumToStringMap[enumVal] || null;
}

export function isPassingGrade(gradeStr) {
  const order = [
    '1.0',
    '1.25',
    '1.5',
    '1.75',
    '2.0',
    '2.25',
    '2.5',
    '2.75',
    '3.0'
  ];
  if (gradeStr === 'INC' || gradeStr === 'DRP') return false;
  if (gradeStr === '4.0' || gradeStr === '5.0') return false;
  return order.includes(gradeStr);
}

export function computeGPA(gradeStrings) {
  const map = {
    '1.0': 1.0,
    '1.25': 1.25,
    '1.5': 1.5,
    '1.75': 1.75,
    '2.0': 2.0,
    '2.25': 2.25,
    '2.5': 2.5,
    '2.75': 2.75,
    '3.0': 3.0,
    '4.0': 4.0,
    '5.0': 5.0
  };

  const numeric = gradeStrings
    .map((g) => map[g])
    .filter((v) => typeof v === 'number');
  if (numeric.length === 0) return null;
  const sum = numeric.reduce((a, b) => a + b, 0);
  return Number((sum / numeric.length).toFixed(2));
}

export function repeatEligibilityDate(subjectType, dateEncoded) {
  const base = new Date(dateEncoded);
  const months = subjectType === 'MAJOR' ? 6 : 12;
  const d = new Date(base.getTime());
  d.setMonth(d.getMonth() + months);
  return d;
}
