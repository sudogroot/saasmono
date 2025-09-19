import type { LevelType, SubjectType } from './dataTypes'
export const PRIMAIRE_LEVELS: LevelType[] = [
  {
    institutionLevel: 'PRIMAIRE',
    codeName: 'PRIMAIRE-1-',
    level: 1,
    displayName: {
      en: 'First Level',
      fr: 'Première année',
      ar: 'السنة الأولى',
    },
    displayDescription: {
      en: 'First year of PRIMAIRE education',
      fr: "Première année de l'enseignement primaire",
      ar: 'السنة الأولى من التعليم الابتدائي',
    },
  },
  {
    institutionLevel: 'PRIMAIRE',
    codeName: 'PRIMAIRE-2-',
    level: 2,
    displayName: {
      en: 'Second Level',
      fr: 'Deuxième année',
      ar: 'السنة الثانية',
    },
    displayDescription: {
      en: 'Second year of PRIMAIRE education',
      fr: "Deuxième année de l'enseignement primaire",
      ar: 'السنة الثانية من التعليم الابتدائي',
    },
  },
  {
    institutionLevel: 'PRIMAIRE',
    codeName: 'PRIMAIRE-3-',
    level: 3,
    displayName: {
      en: 'Third Level',
      fr: 'Troisième année',
      ar: 'السنة الثالثة',
    },
    displayDescription: {
      en: 'Third year of PRIMAIRE education',
      fr: "Troisième année de l'enseignement primaire",
      ar: 'السنة الثالثة من التعليم الابتدائي',
    },
  },
  {
    institutionLevel: 'PRIMAIRE',
    codeName: 'PRIMAIRE-4-',
    level: 4,
    displayName: {
      en: 'Fourth Level',
      fr: 'Quatrième année',
      ar: 'السنة الرابعة',
    },
    displayDescription: {
      en: 'Fourth year of PRIMAIRE education',
      fr: "Quatrième année de l'enseignement primaire",
      ar: 'السنة الرابعة من التعليم الابتدائي',
    },
  },
  {
    institutionLevel: 'PRIMAIRE',
    codeName: 'PRIMAIRE-5-',
    level: 5,
    displayName: {
      en: 'Fifth Level',
      fr: 'Cinquième année',
      ar: 'السنة الخامسة',
    },
    displayDescription: {
      en: 'Fifth year of PRIMAIRE education',
      fr: "Cinquième année de l'enseignement primaire",
      ar: 'السنة الخامسة من التعليم الابتدائي',
    },
  },
  {
    institutionLevel: 'PRIMAIRE',
    codeName: 'PRIMAIRE-6-',
    level: 6,
    displayName: {
      en: 'Sixth Level',
      fr: 'Sixième année',
      ar: 'السنة السادسة',
    },
    displayDescription: {
      en: 'Sixth year of PRIMAIRE education',
      fr: "Sixième année de l'enseignement primaire",
      ar: 'السنة السادسة من التعليم الابتدائي',
    },
  },
]

export const COLLEGE_LEVELS: LevelType[] = [
  {
    institutionLevel: 'COLLEGE',
    codeName: 'COLLEGE-7-',
    level: 7,
    displayName: {
      en: 'Seventh Level',
      fr: 'Septième année',
      ar: 'السنة السابعة',
    },
    displayDescription: {
      en: 'Seventh year of COLLEGE school education',
      fr: "Septième année de l'enseignement secondaire",
      ar: 'السنة السابعة من التعليم المتوسط',
    },
  },
  {
    institutionLevel: 'COLLEGE',
    codeName: 'COLLEGE-8-',
    level: 8,
    displayName: {
      en: 'Eighth Level',
      fr: 'Huitième année',
      ar: 'السنة الثامنة',
    },
    displayDescription: {
      en: 'Eighth year of COLLEGE school education',
      fr: "Huitième année de l'enseignement secondaire",
      ar: 'السنة الثامنة من التعليم المتوسط',
    },
  },
  {
    institutionLevel: 'COLLEGE',
    codeName: 'COLLEGE-9-',
    level: 9,
    displayName: {
      en: 'Ninth Level',
      fr: 'Neuvième année',
      ar: 'السنة التاسعة',
    },
    displayDescription: {
      en: 'Ninth year of COLLEGE school education',
      fr: "Neuvième année de l'enseignement secondaire",
      ar: 'السنة التاسعة من التعليم المتوسط',
    },
  },
]

export const SECONDAIRE_SCHOOL_LEVELS: LevelType[] = [
  {
    institutionLevel: 'SECONDAIRE',
    codeName: 'SECONDAIRE-1-COMMUN',
    section: 'COMMUN',
    level: 1,
    displayName: {
      en: 'First Level',
      fr: 'Première année',
      ar: 'السنة الأولى',
    },
    displayDescription: {
      en: 'First year of SECONDAIRE school education',
      fr: "Première année de l'enseignement secondaire",
      ar: 'السنة الأولى من التعليم الثانوي',
    },
  },
  ////2 eme
  {
    institutionLevel: 'SECONDAIRE',
    codeName: 'SECONDAIRE-2-SCIENCE',
    section: 'SCIENCE',
    level: 2,
    displayName: {
      en: 'Second Level Science',
      fr: 'Deuxième année science',
      ar: 'السنة الثانية علوم',
    },
    displayDescription: {
      en: 'Second year of SECONDAIRE school with science specialization',
      fr: 'Deuxième année du lycée avec spécialisation en sciences',
      ar: 'السنة الثانية من الثانوي بتخصص العلوم',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    codeName: 'SECONDAIRE-2-ECONOMY',
    section: 'ECONOMY',
    level: 2,
    displayName: {
      en: 'Second Level Economy',
      fr: 'Deuxième année économie',
      ar: 'السنة الثانية اقتصاد',
    },
    displayDescription: {
      en: 'Second year of SECONDAIRE school with economy specialization',
      fr: 'Deuxième année du lycée avec spécialisation en économie',
      ar: 'السنة الثانية من الثانوي بتخصص الاقتصاد',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    codeName: 'SECONDAIRE-2-LITERATURE',
    section: 'LITERATURE',
    level: 2,
    displayName: {
      en: 'Second Level Literature',
      fr: 'Deuxième année littérature',
      ar: 'السنة الثانية آداب',
    },
    displayDescription: {
      en: 'Second year of SECONDAIRE school with literature specialization',
      fr: 'Deuxième année du lycée avec spécialisation en littérature',
      ar: 'السنة الثانية من الثانوي بتخصص الآداب',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    codeName: 'SECONDAIRE-2-INFORMATIQUE',
    section: 'INFORMATIQUE',
    level: 2,
    displayName: {
      en: 'Second Level Computer Science',
      fr: 'Deuxième année informatique',
      ar: 'السنة الثانية إعلامية',
    },
    displayDescription: {
      en: 'Second year of SECONDAIRE school with computer science specialization',
      fr: 'Deuxième année du lycée avec spécialisation en informatique',
      ar: 'السنة الثانية من الثانوي بتخصص الإعلامية',
    },
  },
  ////3 eme
  {
    institutionLevel: 'SECONDAIRE',
    codeName: 'SECONDAIRE-3-SCIENCE',
    section: 'SCIENCE',
    level: 3,
    displayName: {
      en: 'Third Level Science',
      fr: 'Troisième année science',
      ar: 'السنة الثالثة علوم',
    },
    displayDescription: {
      en: 'Third year of SECONDAIRE school with science specialization',
      fr: 'Troisième année du lycée avec spécialisation en sciences',
      ar: 'السنة الثالثة من الثانوي بتخصص العلوم',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    codeName: 'SECONDAIRE-3-ECONOMY',
    section: 'ECONOMY',
    level: 3,
    displayName: {
      en: 'Third Level Economy',
      fr: 'Troisième année économie',
      ar: 'السنة الثالثة اقتصاد',
    },
    displayDescription: {
      en: 'Third year of SECONDAIRE school with economy specialization',
      fr: 'Troisième année du lycée avec spécialisation en économie',
      ar: 'السنة الثالثة من الثانوي بتخصص الاقتصاد',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    codeName: 'SECONDAIRE-3-LITERATURE',
    section: 'LITERATURE',
    level: 3,
    displayName: {
      en: 'Third Level Literature',
      fr: 'Troisième année littérature',
      ar: 'السنة الثالثة آداب',
    },
    displayDescription: {
      en: 'Third year of SECONDAIRE school with literature specialization',
      fr: 'Troisième année du lycée avec spécialisation en littérature',
      ar: 'السنة الثالثة من الثانوي بتخصص الآداب',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    codeName: 'SECONDAIRE-3-INFORMATIQUE',
    section: 'INFORMATIQUE',
    level: 3,
    displayName: {
      en: 'Third Level Computer Science',
      fr: 'Troisième année informatique',
      ar: 'السنة الثالثة إعلامية',
    },
    displayDescription: {
      en: 'Third year of SECONDAIRE school with computer science specialization',
      fr: 'Troisième année du lycée avec spécialisation en informatique',
      ar: 'السنة الثالثة من الثانوي بتخصص الإعلامية',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    codeName: 'SECONDAIRE-3-TECHNIQUE',
    section: 'TECHNIQUE',
    level: 3,
    displayName: {
      en: 'Third Level Technical',
      fr: 'Troisième année technique',
      ar: 'السنة الثالثة تقنية',
    },
    displayDescription: {
      en: 'Third year of SECONDAIRE school with technical specialization',
      fr: 'Troisième année du lycée avec spécialisation technique',
      ar: 'السنة الثالثة من الثانوي بتخصص تقني',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    codeName: 'SECONDAIRE-3-SPORT',
    section: 'SPORT',
    level: 3,
    displayName: {
      en: 'Third Level Sport',
      fr: 'Troisième année sport',
      ar: 'السنة الثالثة رياضة',
    },
    displayDescription: {
      en: 'Third year of SECONDAIRE school with sports specialization',
      fr: 'Troisième année du lycée avec spécialisation en sport',
      ar: 'السنة الثالثة من الثانوي بتخصص رياضي',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    codeName: 'SECONDAIRE-3-MATH',
    section: 'MATH',
    level: 3,
    displayName: {
      en: 'Third Level Mathematics',
      fr: 'Troisième année mathématiques',
      ar: 'السنة الثالثة رياضيات',
    },
    displayDescription: {
      en: 'Third year of SECONDAIRE school with mathematics specialization',
      fr: 'Troisième année du lycée avec spécialisation en mathématiques',
      ar: 'السنة الثالثة من الثانوي بتخصص رياضيات',
    },
  },
  ////4 eme
  {
    institutionLevel: 'SECONDAIRE',
    codeName: 'SECONDAIRE-4-SCIENCE',
    section: 'SCIENCE',
    level: 4,
    displayName: {
      en: 'Fourth Level Science',
      fr: 'Quatrième année science',
      ar: 'السنة الرابعة علوم',
    },
    displayDescription: {
      en: 'Fourth year of SECONDAIRE school with science specialization',
      fr: 'Quatrième année du lycée avec spécialisation en sciences',
      ar: 'السنة الرابعة من الثانوي بتخصص العلوم',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    codeName: 'SECONDAIRE-4-ECONOMY',
    section: 'ECONOMY',
    level: 4,
    displayName: {
      en: 'Fourth Level Economy',
      fr: 'Quatrième année économie',
      ar: 'السنة الرابعة اقتصاد',
    },
    displayDescription: {
      en: 'Fourth year of SECONDAIRE school with economy specialization',
      fr: 'Quatrième année du lycée avec spécialisation en économie',
      ar: 'السنة الرابعة من الثانوي بتخصص الاقتصاد',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    codeName: 'SECONDAIRE-4-LITERATURE',
    section: 'LITERATURE',
    level: 4,
    displayName: {
      en: 'Fourth Level Literature',
      fr: 'Quatrième année littérature',
      ar: 'السنة الرابعة آداب',
    },
    displayDescription: {
      en: 'Fourth year of SECONDAIRE school with literature specialization',
      fr: 'Quatrième année du lycée avec spécialisation en littérature',
      ar: 'السنة الرابعة من الثانوي بتخصص الآداب',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    codeName: 'SECONDAIRE-4-INFORMATIQUE',
    section: 'INFORMATIQUE',
    level: 4,
    displayName: {
      en: 'Fourth Level Computer Science',
      fr: 'Quatrième année informatique',
      ar: 'السنة الرابعة إعلامية',
    },
    displayDescription: {
      en: 'Fourth year of SECONDAIRE school with computer science specialization',
      fr: 'Quatrième année du lycée avec spécialisation en informatique',
      ar: 'السنة الرابعة من الثانوي بتخصص الإعلامية',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    codeName: 'SECONDAIRE-4-TECHNIQUE',
    section: 'TECHNIQUE',
    level: 4,
    displayName: {
      en: 'Fourth Level Technical',
      fr: 'Quatrième année technique',
      ar: 'السنة الرابعة تقنية',
    },
    displayDescription: {
      en: 'Fourth year of SECONDAIRE school with technical specialization',
      fr: 'Quatrième année du lycée avec spécialisation technique',
      ar: 'السنة الرابعة من الثانوي بتخصص تقني',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    codeName: 'SECONDAIRE-4-SPORT',
    section: 'SPORT',
    level: 4,
    displayName: {
      en: 'Fourth Level Sport',
      fr: 'Quatrième année sport',
      ar: 'السنة الرابعة رياضة',
    },
    displayDescription: {
      en: 'Fourth year of SECONDAIRE school with sports specialization',
      fr: 'Quatrième année du lycée avec spécialisation en sport',
      ar: 'السنة الرابعة من الثانوي بتخصص رياضي',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    codeName: 'SECONDAIRE-4-MATH',
    section: 'MATH',
    level: 4,
    displayName: {
      en: 'Fourth Level Mathematics',
      fr: 'Quatrième année mathématiques',
      ar: 'السنة الرابعة رياضيات',
    },
    displayDescription: {
      en: 'Fourth year of SECONDAIRE school with mathematics specialization',
      fr: 'Quatrième année du lycée avec spécialisation en mathématiques',
      ar: 'السنة الرابعة من الثانوي بتخصص رياضيات',
    },
  },
]

export const PRIMAIRE_SUBJECTS: SubjectType[] = [
  {
    institutionLevel: 'PRIMAIRE',
    displayName: {
      en: 'Science Awakening',
      fr: 'Éveil scientifique',
      ar: 'الإيقاظ العلمي',
    },
    displayDescription: {
      en: 'Introduction to basic scientific concepts and natural phenomena',
      fr: 'Introduction aux concepts scientifiques de base et aux phénomènes naturels',
      ar: 'مقدمة في المفاهيم العلمية الأساسية والظواهر الطبيعية',
    },
  },
  {
    institutionLevel: 'PRIMAIRE',
    displayName: {
      en: 'Mathematics',
      fr: 'Mathématiques',
      ar: 'الرياضيات',
    },
    displayDescription: {
      en: 'Basic mathematical concepts including numbers, shapes, and simple calculations',
      fr: 'Concepts mathématiques de base incluant les nombres, les formes et les calculs simples',
      ar: 'المفاهيم الرياضية الأساسية بما في ذلك الأرقام والأشكال والحسابات البسيطة',
    },
  },
  {
    institutionLevel: 'PRIMAIRE',
    displayName: {
      en: 'Arabic',
      fr: 'Arabe',
      ar: 'العربية',
    },
    displayDescription: {
      en: 'Introduction to Arabic language and literacy',
      fr: 'Introduction à la langue et littératie arabes',
      ar: 'مقدمة في اللغة العربية والقراءة والكتابة',
    },
  },
  {
    institutionLevel: 'PRIMAIRE',
    displayName: {
      en: 'Reading',
      fr: 'Lecture',
      ar: 'المطالعة',
    },
    displayDescription: {
      en: 'Development of reading skills and comprehension',
      fr: 'Développement des compétences en lecture et compréhension',
      ar: 'تطوير مهارات القراءة والفهم',
    },
  },
  {
    institutionLevel: 'PRIMAIRE',
    displayName: {
      en: 'Drawing',
      fr: 'Dessin',
      ar: 'الرسم',
    },
    displayDescription: {
      en: 'Introduction to visual arts and creative expression through drawing',
      fr: 'Introduction aux arts visuels et expression créative par le dessin',
      ar: 'مقدمة في الفنون البصرية والتعبير الإبداعي من خلال الرسم',
    },
  },
  {
    institutionLevel: 'PRIMAIRE',
    displayName: {
      en: 'Music',
      fr: 'Musique',
      ar: 'الموسيقى',
    },
    displayDescription: {
      en: 'Introduction to music appreciation and basic musical concepts',
      fr: "Introduction à l'appréciation musicale et concepts musicaux de base",
      ar: 'مقدمة في الاستماع الموسيقي والمفاهيم الموسيقية الأساسية',
    },
  },
  {
    institutionLevel: 'PRIMAIRE',
    displayName: {
      en: 'Physical Education',
      fr: 'Éducation physique',
      ar: 'التربية البدنية',
    },
    displayDescription: {
      en: 'Physical activities and games to promote health and coordination',
      fr: 'Activités physiques et jeux pour promouvoir la santé et coordination',
      ar: 'الأنشطة البدنية والألعاب لتعزيز الصحة والتنسيق',
    },
  },
  {
    institutionLevel: 'PRIMAIRE',
    displayName: {
      en: 'Technology',
      fr: 'Technologie',
      ar: 'التربية التكنولوجية',
    },
    displayDescription: {
      en: 'Introduction to basic technological concepts and tools',
      fr: 'Introduction aux concepts technologiques de base et outils',
      ar: 'مقدمة في المفاهيم التكنولوجية الأساسية والأدوات',
    },
  },
  {
    institutionLevel: 'PRIMAIRE',
    displayName: {
      en: 'Islamic Education',
      fr: 'Éducation islamique',
      ar: 'التربية الإسلامية',
    },
    displayDescription: {
      en: 'Introduction to Islamic principles and moral values',
      fr: 'Introduction aux principes islamiques et valeurs morales',
      ar: 'مقدمة في المبادئ الإسلامية والقيم الأخلاقية',
    },
  },
  {
    institutionLevel: 'PRIMAIRE',
    displayName: {
      en: 'French',
      fr: 'Français',
      ar: 'اللغة الفرنسية',
    },
    displayDescription: {
      en: 'Introduction to French language and culture',
      fr: 'Introduction à la langue et culture françaises',
      ar: 'مقدمة في اللغة والثقافة الفرنسية',
    },
  },
  {
    institutionLevel: 'PRIMAIRE',
    displayName: {
      en: 'Media Education',
      fr: 'Éducation aux médias',
      ar: 'التربية الإعلامية',
    },
    displayDescription: {
      en: 'Understanding media and responsible media consumption',
      fr: 'Compréhension des médias et consommation responsable',
      ar: 'فهم الإعلام والاستهلاك المسؤول للإعلام',
    },
  },
  {
    institutionLevel: 'PRIMAIRE',
    displayName: {
      en: 'History and Geography',
      fr: 'Histoire et géographie',
      ar: 'التاريخ والجغرافيا',
    },
    displayDescription: {
      en: 'Introduction to local history and basic geographical concepts',
      fr: "Introduction à l'histoire locale et concepts géographiques de base",
      ar: 'مقدمة في التاريخ المحلي والمفاهيم الجغرافية الأساسية',
    },
  },
  {
    institutionLevel: 'PRIMAIRE',
    displayName: {
      en: 'Civic Education',
      fr: 'Éducation civique',
      ar: 'التربية المدنية',
    },
    displayDescription: {
      en: 'Introduction to citizenship and community values',
      fr: 'Introduction à la citoyenneté et valeurs communautaires',
      ar: 'مقدمة في المواطنة وقيم المجتمع',
    },
  },
  {
    institutionLevel: 'PRIMAIRE',
    displayName: {
      en: 'English',
      fr: 'Anglais',
      ar: 'اللغة الإنجليزية',
    },
    displayDescription: {
      en: 'Introduction to English language and basic communication',
      fr: 'Introduction à la langue anglaise et communication de base',
      ar: 'مقدمة في اللغة الإنجليزية والتواصل الأساسي',
    },
  },
]

export const COLLEGE_SUBJECTS: SubjectType[] = [
  {
    institutionLevel: 'COLLEGE',
    displayName: {
      en: 'Arabic',
      fr: 'Arabe',
      ar: 'العربیّة',
    },
    displayDescription: {
      en: 'Study of Arabic language and literature',
      fr: 'Étude de la langue et littérature arabes',
      ar: 'دراسة اللغة والأدب العربي',
    },
  },
  {
    institutionLevel: 'COLLEGE',
    displayName: {
      en: 'French',
      fr: 'Français',
      ar: 'الفرنسیّة',
    },
    displayDescription: {
      en: 'Study of French language and culture',
      fr: 'Étude de la langue et culture françaises',
      ar: 'دراسة اللغة والثقافة الفرنسية',
    },
  },
  {
    institutionLevel: 'COLLEGE',
    displayName: {
      en: 'English',
      fr: 'Anglais',
      ar: 'الانقلیزیّة',
    },
    displayDescription: {
      en: 'Study of English language and literature',
      fr: 'Étude de la langue et littérature anglaises',
      ar: 'دراسة اللغة والأدب الإنجليزي',
    },
  },
  {
    institutionLevel: 'COLLEGE',
    displayName: {
      en: 'Islamic Education',
      fr: 'Éducation islamique',
      ar: 'التّربیة الإسلامیّة',
    },
    displayDescription: {
      en: 'Study of Islamic principles and teachings',
      fr: 'Étude des principes et enseignements islamiques',
      ar: 'دراسة المبادئ والتعاليم الإسلامية',
    },
  },
  {
    institutionLevel: 'COLLEGE',
    displayName: {
      en: 'Civic Education',
      fr: 'Éducation civique',
      ar: 'التّربیة المدنیّة',
    },
    displayDescription: {
      en: 'Study of citizenship and civic responsibilities',
      fr: 'Étude de la citoyenneté et responsabilités civiques',
      ar: 'دراسة المواطنة والمسؤوليات المدنية',
    },
  },
  {
    institutionLevel: 'COLLEGE',
    displayName: {
      en: 'History',
      fr: 'Histoire',
      ar: 'التّاریخ',
    },
    displayDescription: {
      en: 'Study of historical events and civilizations',
      fr: 'Étude des événements historiques et civilisations',
      ar: 'دراسة الأحداث التاريخية والحضارات',
    },
  },
  {
    institutionLevel: 'COLLEGE',
    displayName: {
      en: 'Geography',
      fr: 'Géographie',
      ar: 'الجغرافیا',
    },
    displayDescription: {
      en: "Study of the Earth's physical features and human geography",
      fr: 'Étude des caractéristiques physiques de la Terre et géographie humaine',
      ar: 'دراسة المعالم الجغرافية للأرض والجغرافيا البشرية',
    },
  },
  {
    institutionLevel: 'COLLEGE',
    displayName: {
      en: 'Mathematics',
      fr: 'Mathématiques',
      ar: 'الرّیاضیات',
    },
    displayDescription: {
      en: 'Study of numbers, shapes, and mathematical reasoning',
      fr: 'Étude des nombres, formes et raisonnement mathématique',
      ar: 'دراسة الأرقام والأشكال والتفكير الرياضي',
    },
  },
  {
    institutionLevel: 'COLLEGE',
    displayName: {
      en: 'Physics',
      fr: 'Physique',
      ar: 'العلوم الفیزیائیّة',
    },
    displayDescription: {
      en: 'Study of matter, energy, and physical laws',
      fr: 'Étude de la matière, énergie et lois physiques',
      ar: 'دراسة المادة والطاقة والقوانين الفيزيائية',
    },
  },
  {
    institutionLevel: 'COLLEGE',
    displayName: {
      en: 'Life and Earth Sciences',
      fr: 'Sciences de la vie et de la terre',
      ar: 'علوم الحیاة والأرض',
    },
    displayDescription: {
      en: 'Study of living organisms and Earth systems',
      fr: 'Étude des organismes vivants et systèmes terrestres',
      ar: 'دراسة الكائنات الحية وأنظمة الأرض',
    },
  },
  {
    institutionLevel: 'COLLEGE',
    displayName: {
      en: 'Technology',
      fr: 'Technologie',
      ar: 'التّربیة التّكنولوجیّة',
    },
    displayDescription: {
      en: 'Study of technological systems and applications',
      fr: 'Étude des systèmes technologiques et applications',
      ar: 'دراسة الأنظمة التكنولوجية والتطبيقات',
    },
  },
  {
    institutionLevel: 'COLLEGE',
    displayName: {
      en: 'Informatics',
      fr: 'Informatique',
      ar: 'الإعلامیّة',
    },
    displayDescription: {
      en: 'Study of computer science and information technology',
      fr: "Étude de l'informatique et technologies de l'information",
      ar: 'دراسة علوم الحاسوب وتكنولوجيا المعلومات',
    },
  },
  {
    institutionLevel: 'COLLEGE',
    displayName: {
      en: 'Music Education',
      fr: 'Éducation musicale',
      ar: 'التّربیة الموسیقیّة',
    },
    displayDescription: {
      en: 'Study of music theory and practice',
      fr: 'Étude de la théorie musicale et pratique',
      ar: 'دراسة النظرية الموسيقية والممارسة',
    },
  },
  {
    institutionLevel: 'COLLEGE',
    displayName: {
      en: 'Visual Arts',
      fr: 'Arts visuels',
      ar: 'التّربیة التّشكیلیّة',
    },
    displayDescription: {
      en: 'Study of visual arts and artistic expression',
      fr: 'Étude des arts visuels et expression artistique',
      ar: 'دراسة الفنون البصرية والتعبير الفني',
    },
  },
  {
    institutionLevel: 'COLLEGE',
    displayName: {
      en: 'Theater Education',
      fr: 'Éducation théâtrale',
      ar: 'التّربیة المسرحیّة',
    },
    displayDescription: {
      en: 'Study of theater and dramatic arts',
      fr: 'Étude du théâtre et arts dramatiques',
      ar: 'دراسة المسرح والفنون المسرحية',
    },
  },
  {
    institutionLevel: 'COLLEGE',
    displayName: {
      en: 'Physical Education',
      fr: 'Éducation physique',
      ar: 'التّربیة البدنیّة',
    },
    displayDescription: {
      en: 'Study of physical activities and sports',
      fr: 'Étude des activités physiques et sports',
      ar: 'دراسة الأنشطة البدنية والرياضة',
    },
  },
]

export const SECONDAIRE_SCHOOL_SUBJECTS: SubjectType[] = [
  {
    institutionLevel: 'SECONDAIRE',
    levelCodeName: ['SECONDAIRE-3-INFORMATIQUE', 'SECONDAIRE-3-INFORMATIQUE'],
    displayName: {
      en: 'Algorithms and Programming',
      fr: 'Algorithmes et Programmation',
      ar: 'الخوارزمیّات والبرمجة',
    },
    displayDescription: {
      en: 'Study of algorithms, programming concepts, and software development',
      fr: 'Étude des algorithmes, concepts de programmation et développement logiciel',
      ar: 'دراسة الخوارزميات ومفاهيم البرمجة وتطوير البرمجيات',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    levelCodeName: ['SECONDAIRE-3-INFORMATIQUE', 'SECONDAIRE-3-INFORMATIQUE'],
    displayName: {
      en: 'Information and Communication Technology',
      fr: "Technologies de l'information et de la communication",
      ar: 'تكنولوجیا المعلومات والاتّصال',
    },
    displayDescription: {
      en: 'Study of information systems, communication technologies, and digital tools',
      fr: "Étude des systèmes d'information, technologies de communication et outils numériques",
      ar: 'دراسة أنظمة المعلومات وتقنيات الاتصال والأدوات الرقمية',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    levelCodeName: ['SECONDAIRE-3-INFORMATIQUE'],
    displayName: {
      en: 'Systems and Networks',
      fr: 'Systèmes et Réseaux',
      ar: 'الأنظمة والشّبكات',
    },
    displayDescription: {
      en: 'Study of computer systems, network architecture, and infrastructure',
      fr: 'Étude des systèmes informatiques, architecture réseau et infrastructure',
      ar: 'دراسة أنظمة الحاسوب وهيكل الشبكات والبنية التحتية',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    levelCodeName: ['SECONDAIRE-4-INFORMATIQUE'],
    displayName: {
      en: 'Databases',
      fr: 'Bases de données',
      ar: 'قواعد البیانات',
    },
    displayDescription: {
      en: 'Study of database design, management, and data manipulation',
      fr: 'Étude de la conception, gestion et manipulation des bases de données',
      ar: 'دراسة تصميم قواعد البيانات وإدارتها ومعالجة البيانات',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    levelCodeName: ['SECONDAIRE-2-ECONOMY', 'SECONDAIRE-3-ECONOMY', 'SECONDAIRE-4-ECONOMY'],
    displayName: {
      en: 'Economics',
      fr: 'Économie',
      ar: 'الاقتصاد',
    },
    displayDescription: {
      en: 'Study of economic principles, markets, and financial systems',
      fr: 'Étude des principes économiques, marchés et systèmes financiers',
      ar: 'دراسة المبادئ الاقتصادية والأسواق والأنظمة المالية',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    levelCodeName: ['SECONDAIRE-2-ECONOMY', 'SECONDAIRE-3-ECONOMY', 'SECONDAIRE-4-ECONOMY'],
    displayName: {
      en: 'Management',
      fr: 'Gestion',
      ar: 'التصرّف',
    },
    displayDescription: {
      en: 'Study of business management, organizational behavior, and leadership',
      fr: "Étude de la gestion d'entreprise, comportement organisationnel et leadership",
      ar: 'دراسة إدارة الأعمال وسلوك المنظمات والقيادة',
    },
  },

  /// Most common subjects
  {
    institutionLevel: 'SECONDAIRE',
    displayName: {
      en: 'Arabic',
      fr: 'Arabe',
      ar: 'العربیّة',
    },
    displayDescription: {
      en: 'Advanced study of Arabic language, literature, and grammar',
      fr: 'Étude avancée de la langue arabe, littérature et grammaire',
      ar: 'دراسة متقدمة للغة العربية والأدب والنحو',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    displayName: {
      en: 'French',
      fr: 'Français',
      ar: 'الفرنسیّة',
    },
    displayDescription: {
      en: 'Advanced study of French language, literature, and culture',
      fr: 'Étude avancée de la langue française, littérature et culture',
      ar: 'دراسة متقدمة للغة الفرنسية والأدب والثقافة',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    displayName: {
      en: 'English',
      fr: 'Anglais',
      ar: 'الانقلیزیّة',
    },
    displayDescription: {
      en: 'Advanced study of English language, literature, and communication',
      fr: 'Étude avancée de la langue anglaise, littérature et communication',
      ar: 'دراسة متقدمة للغة الإنجليزية والأدب والتواصل',
    },
  },

  // non common subjects
  {
    institutionLevel: 'SECONDAIRE',
    levelCodeName: [
      'SECONDAIRE-1-*',
      'SECONDAIRE-2-*',
      'SECONDAIRE-3-*',
      'SECONDAIRE-4-LITERATURE',
      'SECONDAIRE-4-ECONOMY',
    ],
    displayName: {
      en: 'History',
      fr: 'Histoire',
      ar: 'التّاریخ',
    },
    displayDescription: {
      en: 'Study of historical events, civilizations, and their impact on society',
      fr: 'Étude des événements historiques, civilisations et leur impact sur la société',
      ar: 'دراسة الأحداث التاريخية والحضارات وتأثيرها على المجتمع',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    levelCodeName: [
      'SECONDAIRE-1-*',
      'SECONDAIRE-2-*',
      'SECONDAIRE-3-*',
      'SECONDAIRE-4-LITERATURE',
      'SECONDAIRE-4-ECONOMY',
    ],
    displayName: {
      en: 'Geography',
      fr: 'Géographie',
      ar: 'الجغرافیا',
    },
    displayDescription: {
      en: 'Study of physical and human geography, spatial relationships, and environmental issues',
      fr: 'Étude de la géographie physique et humaine, relations spatiales et problèmes environnementaux',
      ar: 'دراسة الجغرافيا الطبيعية والبشرية والعلاقات المكانية والقضايا البيئية',
    },
  },

  {
    institutionLevel: 'SECONDAIRE',
    levelCodeName: [
      'SECONDAIRE-1-*',
      'SECONDAIRE-2-*',
      'SECONDAIRE-3-LITERATURE',
      'SECONDAIRE-4-LITERATURE',
      'SECONDAIRE-3-MATH',
      'SECONDAIRE-3-SCIENCE',
    ],
    displayName: {
      en: 'Islamic Thinking',
      fr: 'Pensée islamique',
      ar: 'التّفكیر الإسلامي',
    },
    displayDescription: {
      en: 'Study of Islamic principles, ethics, and philosophical thought',
      fr: 'Étude des principes islamiques, éthique et pensée philosophique',
      ar: 'دراسة المبادئ الإسلامية والأخلاق والفكر الفلسفي',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    levelCodeName: ['SECONDAIRE-1-*', 'SECONDAIRE-2-*', 'SECONDAIRE-3-LITERATURE'],
    displayName: {
      en: 'Civic Education',
      fr: 'Éducation civique',
      ar: 'التّربیة المدنیّة',
    },
    displayDescription: {
      en: 'Study of citizenship, democracy, and civic responsibilities',
      fr: 'Étude de la citoyenneté, démocratie et responsabilités civiques',
      ar: 'دراسة المواطنة والديمقراطية والمسؤوليات المدنية',
    },
  },

  {
    institutionLevel: 'SECONDAIRE',
    levelCodeName: ['SECONDAIRE-3-*', 'SECONDAIRE-4-*'],
    displayName: {
      en: 'Philosophy',
      fr: 'Philosophie',
      ar: 'الفلسفة',
    },
    displayDescription: {
      en: 'Study of philosophical concepts, critical thinking, and human existence',
      fr: 'Étude des concepts philosophiques, pensée critique et existence humaine',
      ar: 'دراسة المفاهيم الفلسفية والتفكير النقدي ووجود الإنسان',
    },
  },

  {
    institutionLevel: 'SECONDAIRE',
    levelCodeName: [
      'SECONDAIRE-1-*',
      'SECONDAIRE-2-*',
      'SECONDAIRE-3-MATH',
      'SECONDAIRE-4-MATH',
      'SECONDAIRE-3-SCIENCE',
      'SECONDAIRE-4-SCIENCE',
      'SECONDAIRE-3-TECHNIQUE',
      'SECONDAIRE-4-TECHNIQUE',
      'SECONDAIRE-3-INFORMATIQUE',
      'SECONDAIRE-4-INFORMATIQUE',
      'SECONDAIRE-3-ECONOMY',
      'SECONDAIRE-4-ECONOMY',
    ],
    levelCodeNameOptional: ['SECONDAIRE-3-LITERATURE', 'SECONDAIRE-4-LITERATURE'],
    displayName: {
      en: 'Mathematics',
      fr: 'Mathématiques',
      ar: 'الرّیاضیات',
    },
    displayDescription: {
      en: 'Advanced study of mathematical concepts, calculus, and problem-solving',
      fr: 'Étude avancée des concepts mathématiques, calcul et résolution de problèmes',
      ar: 'دراسة متقدمة للمفاهيم الرياضية والحساب وحل المشكلات',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    levelCodeName: [
      'SECONDAIRE-1-*',
      'SECONDAIRE-2-MATH',
      'SECONDAIRE-3-MATH',
      'SECONDAIRE-4-MATH',
      'SECONDAIRE-2-SCIENCE',
      'SECONDAIRE-3-SCIENCE',
      'SECONDAIRE-4-SCIENCE',
      'SECONDAIRE-2-TECHNIQUE',
      'SECONDAIRE-3-TECHNIQUE',
      'SECONDAIRE-4-TECHNIQUE',
      'SECONDAIRE-2-INFORMATIQUE',
      'SECONDAIRE-3-INFORMATIQUE',
      'SECONDAIRE-4-INFORMATIQUE',
    ],
    displayName: {
      en: 'Physics',
      fr: 'Physique',
      ar: 'العلوم الفیزیائیّة',
    },
    displayDescription: {
      en: 'Study of physical laws, mechanics, electricity, and modern physics',
      fr: 'Étude des lois physiques, mécanique, électricité et physique moderne',
      ar: 'دراسة القوانين الفيزيائية والميكانيك والكهرباء والفيزياء الحديثة',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    levelCodeName: [
      'SECONDAIRE-1-*',
      'SECONDAIRE-2-LITERATURE',
      'SECONDAIRE-2-MATH',
      'SECONDAIRE-3-MATH',
      'SECONDAIRE-4-MATH',
      'SECONDAIRE-2-SCIENCE',
      'SECONDAIRE-3-SCIENCE',
      'SECONDAIRE-4-SCIENCE',
      'SECONDAIRE-2-TECHNIQUE',
    ],
    levelCodeNameOptional: ['SECONDAIRE-3-LITERATURE', 'SECONDAIRE-4-LITERATURE'],

    displayName: {
      en: 'Life and Earth Sciences',
      fr: 'Sciences de la vie et de la terre',
      ar: 'علوم الحیاة والأرض',
    },
    displayDescription: {
      en: 'Study of biology, geology, ecology, and environmental sciences',
      fr: 'Étude de la biologie, géologie, écologie et sciences environnementales',
      ar: 'دراسة علم الأحياء والجيولوجيا والبيئة والعلوم البيئية',
    },
  },

  {
    institutionLevel: 'SECONDAIRE',
    levelCodeName: [
      'SECONDAIRE-1-*',
      'SECONDAIRE-2-MATH',
      'SECONDAIRE-2-SCIENCE',
      'SECONDAIRE-2-TECHNIQUE',
      'SECONDAIRE-3-TECHNIQUE',
      'SECONDAIRE-4-TECHNIQUE',
      'SECONDAIRE-2-INFORMATIQUE',
    ],
    displayName: {
      en: 'Technology',
      fr: 'Technologie',
      ar: 'التّكنولوجیا',
    },
    displayDescription: {
      en: 'Study of technological systems, engineering principles, and innovation',
      fr: "Étude des systèmes technologiques, principes d'ingénierie et innovation",
      ar: 'دراسة الأنظمة التكنولوجية ومبادئ الهندسة والابتكار',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    levelCodeName: [
      'SECONDAIRE-3-LITERATURE',
      'SECONDAIRE-4-LITERATURE',
      'SECONDAIRE-2-ECONOMY',
      'SECONDAIRE-3-ECONOMY',
      'SECONDAIRE-4-ECONOMY',
      'SECONDAIRE-3-MATH',
      'SECONDAIRE-4-MATH',
      'SECONDAIRE-3-SCIENCE',
      'SECONDAIRE-4-SCIENCE',
      'SECONDAIRE-3-TECHNIQUE',
      'SECONDAIRE-4-TECHNIQUE',
      'SECONDAIRE-2-INFORMATIQUE',
    ],
    displayName: {
      en: 'Informatics',
      fr: 'Informatique',
      ar: 'الإعلامیّة',
    },
    displayDescription: {
      en: 'Study of computer science, software development, and information systems',
      fr: "Étude de l'informatique, développement logiciel et systèmes d'information",
      ar: 'دراسة علوم الحاسوب وتطوير البرمجيات وأنظمة المعلومات',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    displayName: {
      en: 'Physical Education',
      fr: 'Éducation physique',
      ar: 'التّربیة البدنیّة',
    },
    displayDescription: {
      en: 'Study of physical activities, sports, and health education',
      fr: 'Étude des activités physiques, sports et éducation à la santé',
      ar: 'دراسة الأنشطة البدنية والرياضة والتربية الصحية',
    },
  },

  // optional subjects for all SECONDAIRE level

  {
    institutionLevel: 'SECONDAIRE',
    isOptional: true,
    displayName: {
      en: 'German',
      fr: 'Allemand',
      ar: 'الألمانیّة',
    },
    displayDescription: {
      en: 'Study of German language, literature, and culture',
      fr: 'Étude de la langue allemande, littérature et culture',
      ar: 'دراسة اللغة الألمانية والأدب والثقافة',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    isOptional: true,
    displayName: {
      en: 'Spanish',
      fr: 'Espagnol',
      ar: 'الإسبانیّة',
    },
    displayDescription: {
      en: 'Study of Spanish language, literature, and culture',
      fr: 'Étude de la langue espagnole, littérature et culture',
      ar: 'دراسة اللغة الإسبانية والأدب والثقافة',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    isOptional: true,
    displayName: {
      en: 'Italian',
      fr: 'Italien',
      ar: 'الإیطالیّة',
    },
    displayDescription: {
      en: 'Study of Italian language, literature, and culture',
      fr: 'Étude de la langue italienne, littérature et culture',
      ar: 'دراسة اللغة الإيطالية والأدب والثقافة',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    isOptional: true,
    displayName: {
      en: 'Russian',
      fr: 'Russe',
      ar: 'الرّوسیّة',
    },
    displayDescription: {
      en: 'Study of Russian language, literature, and culture',
      fr: 'Étude de la langue russe, littérature et culture',
      ar: 'دراسة اللغة الروسية والأدب والثقافة',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    isOptional: true,
    displayName: {
      en: 'Chinese',
      fr: 'Chinois',
      ar: 'الصّینیّة',
    },
    displayDescription: {
      en: 'Study of Chinese language, literature, and culture',
      fr: 'Étude de la langue chinoise, littérature et culture',
      ar: 'دراسة اللغة الصينية والأدب والثقافة',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    isOptional: true,
    displayName: {
      en: 'Visual Arts',
      fr: 'Arts visuels',
      ar: 'التّربیة التّشكیلیّة',
    },
    displayDescription: {
      en: 'Study of visual arts, drawing, painting, and artistic expression',
      fr: 'Étude des arts visuels, dessin, peinture et expression artistique',
      ar: 'دراسة الفنون البصرية والرسم والتلوين والتعبير الفني',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    isOptional: true,
    displayName: {
      en: 'Music Education',
      fr: 'Éducation musicale',
      ar: 'التّربیة الموسیقیّة',
    },
    displayDescription: {
      en: 'Study of music theory, appreciation, and musical performance',
      fr: 'Étude de la théorie musicale, appréciation et performance musicale',
      ar: 'دراسة النظرية الموسيقية والاستماع والأداء الموسيقي',
    },
  },
  {
    institutionLevel: 'SECONDAIRE',
    isOptional: true,
    displayName: {
      en: 'Project Achievement',
      fr: 'Réalisation de projet',
      ar: 'إنجاز مشروع',
    },
    displayDescription: {
      en: 'Practical project work, research, and implementation of student projects',
      fr: 'Travail pratique de projet, recherche et mise en œuvre de projets étudiants',
      ar: 'العمل العملي على المشاريع والبحث وتنفيذ مشاريع الطلاب',
    },
  },
]
