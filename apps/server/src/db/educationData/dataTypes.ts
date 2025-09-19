export interface LevelType {
  // id: number;
  institutionLevel: InstitutionLevelType
  codeName: `${InstitutionLevelType}-${string}-${SectionType}` | `${InstitutionLevelType}-${string}-`
  section?: SectionType
  level: number
  displayName?: {
    // this is for translation
    en: string
    fr: string
    ar: string
  }
  displayDescription?: {
    // this is for translation
    en: string
    fr: string
    ar: string
  }
}

// ELEMENTARY = mardasah
// MIDDLE = college
// HIGH = lycee
// UNIVERSITY = universite

export type InstitutionLevelType = 'JARDIN' | 'PRIMAIRE' | 'COLLEGE' | 'SECONDAIRE' | 'SUPERIEUR'
// export type CodeNameSuffixType = 'ELE' | 'MID' | 'HIG' | 'UNI';
export type SectionType =
  | 'COMMUN'
  | 'SCIENCE'
  | 'MATH'
  | 'LITERATURE'
  | 'TECHNIQUE'
  | 'SPORT'
  | 'ECONOMY'
  | 'INFORMATIQUE'
// export type SectionSuffixType = 'COM' | 'SCI' | 'MAT' | 'LIT' | 'TEC' | 'SPO' | 'ECO' | 'INF';

export type LevelCodeNameType = LevelType['codeName']

export type SectionCodeNameType = `${LevelType['level']}-${SectionType}`

// Mappers
// export const sectionToSuffix: Record<SectionType, SectionSuffixType> = {
//   COMMUN: 'COM',
//   SCIENCE: 'SCI',
//   MATH: 'MAT',
//   LITERATURE: 'LIT',
//   TECHNIQUE: 'TEC',
//   SPORT: 'SPO',
//   ECONOMY: 'ECO',
//   INFORMATIQUE: 'INF',
// };

// export const sectionSuffixToSection: Record<SectionSuffixType, SectionType> = {
//   COM: 'COMMUN',
//   SCI: 'SCIENCE',
//   MAT: 'MATH',
//   LIT: 'LITERATURE',
//   TEC: 'TECHNIQUE',
//   SPO: 'SPORT',
//   ECO: 'ECONOMY',
//   INF: 'INFORMATIQUE',
// };

// export const institutionLevelToCodeNameSuffix: Record<InstitutionLevelType, CodeNameSuffixType> = {
//   ELEMENTARY: 'ELE',
//   MIDDLE: 'MID',
//   HIGH: 'HIG',
//   UNIVERSITY: 'UNI',
// };

// export const codeNameSuffixToInstitutionLevel: Record<CodeNameSuffixType, InstitutionLevelType> = {
//   ELE: 'ELEMENTARY',
//   MID: 'MIDDLE',
//   HIG: 'HIGH',
//   UNI: 'UNIVERSITY',
// };

// subjects types

export interface SubjectType {
  institutionLevel: InstitutionLevelType
  levelCodeName?: Array<`${InstitutionLevelType}-${string}-${SectionType}` | `${InstitutionLevelType}-${string}-*`>
  levelCodeNameOptional?: Array<
    `${InstitutionLevelType}-${string}-${SectionType}` | `${InstitutionLevelType}-${string}-*`
  >
  // codeName: SubjectCodeNameType;
  isOptional?: boolean
  displayName: {
    en: string
    fr: string
    ar: string
  }
  displayDescription?: {
    en: string
    fr: string
    ar: string
  }
}

export type SubjectCodeNameType = `${InstitutionLevelType}-${string}`

// TODO need to move this to a config file and create tables for it
export type AccountType = 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN'
export type PaymentTemplate = 'HOURLY' | 'MONTHLY' | 'YEARLY' | 'SEMESTERLY' | 'TERMLY' | 'ONCE' | 'ATTENDANCE' // we only support by attendance for now; we need to support monthly and yearly, semesterly

export interface OrganizationConfigType {
  institution: InstitutionLevelType[]
  studentPaymentTemplates: Array<PaymentTemplate> | 'ALL' // is it student or parent
  teacherPaymentTemplates: Array<PaymentTemplate> | 'ALL'
  // resourcesPaymentTemplate: Array<PaymentTemplate> | 'ALL'; // not sure about this, adding it here to keep it in mind (resources like books, paper, transportation/services, and other resources)
  accounts: Array<AccountType> | 'ALL'
}
