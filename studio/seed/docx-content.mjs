// محتوى مأخوذ من ديباجة المؤتمر المعتمدة (ملف Word) — المصدر لصفحات: حول المؤتمر، المحاور، اللجان، المشاركة والنشر
const doc = (type, id, data) => ({_type: type, _id: id, ...data})
const k = (p, i) => `${p}${i + 1}`

const INST = {
  'جامعة فرحات عباس سطيف 1، الجزائر': 'Ferhat Abbas University Setif 1, Algeria',
  'جامعة برج بوعريريج، الجزائر': 'University of Bordj Bou Arreridj, Algeria',
  'جامعة الجزائر 3، الجزائر': 'University of Algiers 3, Algeria',
  'جامعة باتنة 1، الجزائر': 'University of Batna 1, Algeria',
  'جامعة تيزي وزو، الجزائر': 'University of Tizi Ouzou, Algeria',
  'المعهد الوطني الجزائري للبحث الزراعي (INRAA)، الجزائر': 'National Institute of Agronomic Research (INRAA), Algeria',
  'جامعة عنابة، الجزائر': 'University of Annaba, Algeria',
  'وزارة الفلاحة والتنمية الريفية والصيد البحري، الجزائر': 'Ministry of Agriculture, Rural Development and Fisheries, Algeria',
  'منظمة الأغذية والزراعة للأمم المتحدة (FAO)، مكتب الجزائر': 'Food and Agriculture Organization of the UN (FAO), Algeria Office',
  'المدرسة الوطنية العليا للفلاحة، الجزائر': 'National Higher School of Agronomy, Algeria',
  'جامعة سطيف 1 / مركز البحث في البيوتكنولوجيا (CRBt) قسنطينة، الجزائر': 'Setif 1 University / Biotechnology Research Center (CRBt) Constantine, Algeria',
  'جامعة نيكولاس كوبرنيكوس في تورون، بولندا': 'Nicolaus Copernicus University in Toruń, Poland',
  'جامعة تورينو، إيطاليا': 'University of Turin, Italy',
  'جامعة إلميناو التقنية، ألمانيا': 'Technische Universität Ilmenau, Germany',
  'الجامعة الإسلامية العالمية، ماليزيا': 'International Islamic University Malaysia',
  'جامعة الملك عبد العزيز، جدة، المملكة العربية السعودية': 'King Abdulaziz University, Jeddah, Saudi Arabia',
  'جامعة IPB، بوغور، إندونيسيا': 'IPB University, Bogor, Indonesia',
  'جامعة SZABIST، إسلام آباد، باكستان': 'SZABIST University, Islamabad, Pakistan',
  'جامعة سطيف 1': 'Setif 1 University',
}
const S1 = 'جامعة فرحات عباس سطيف 1، الجزائر'
const sci = [
  ['أ.د. بوقاعة زينب', S1, 'رئيسة اللجنة العلمية', 'Chair of the Scientific Committee'], ['أ.د. لطرش ذهبية', S1], ['أ.د. بلعة جويدة', S1], ['أ.د. حرفوش سهام', S1],
  ['أ.د. هباش فارس', S1], ['أ.د. بن عواق شرف الدين أمين', S1], ['أ.د. زيات عادل', S1], ['أ.د. هواري عبد القادر', S1], ['أ.د. رقاد صليحة', S1],
  ['أ.د. قطوش مريم', S1], ['د. هادي صادق', S1], ['د. صحراوي إيمان', S1], ['د. زيتوني هند', S1],
  ['أ.د. قايدي خميسي', 'جامعة برج بوعريريج، الجزائر'], ['أ.د. سويسي عبد الوهاب', 'جامعة الجزائر 3، الجزائر'], ['أ.د. بلخباط جمال', 'جامعة باتنة 1، الجزائر'],
  ['أ.د. لعمارة حجو', 'جامعة تيزي وزو، الجزائر'], ['أ.د. ليماني وسيلة', 'المعهد الوطني الجزائري للبحث الزراعي (INRAA)، الجزائر'], ['أ.د. بوشنقير إيمان', 'جامعة عنابة، الجزائر'],
  ['د. بوراس نعيمة', 'وزارة الفلاحة والتنمية الريفية والصيد البحري، الجزائر'], ['د. عمروني حواء', 'المعهد الوطني الجزائري للبحث الزراعي (INRAA)، الجزائر'],
  ['أ.د. باشا فضيلة', 'المعهد الوطني الجزائري للبحث الزراعي (INRAA)، الجزائر'], ['د. دمدوم سمير', 'منظمة الأغذية والزراعة للأمم المتحدة (FAO)، مكتب الجزائر'],
  ['د. داودي علي', 'المدرسة الوطنية العليا للفلاحة، الجزائر'], ['أ.د. صبحي وداد', 'جامعة سطيف 1 / مركز البحث في البيوتكنولوجيا (CRBt) قسنطينة، الجزائر'],
  ['د. Aranka Ignasiak-Szulc', 'جامعة نيكولاس كوبرنيكوس في تورون، بولندا'], ['د. Davide Calandra', 'جامعة تورينو، إيطاليا'], ['د. Kerstin Pezoldt', 'جامعة إلميناو التقنية، ألمانيا'],
  ['د. Michał Buszko', 'جامعة نيكولاس كوبرنيكوس في تورون، بولندا'], ['أ.د. محمد أسلم حنيف', 'الجامعة الإسلامية العالمية، ماليزيا'],
  ['أ.د. أحمد بلوافي', 'جامعة الملك عبد العزيز، جدة، المملكة العربية السعودية'], ['د. Irfan Syauqi Beik', 'جامعة IPB، بوغور، إندونيسيا'], ['د. Sanaullah Ansari', 'جامعة SZABIST، إسلام آباد، باكستان'],
]
const org = ['د. حرفوش أنيسة', 'د. خلفي رفيق', 'د. خواثرة سعيدة', 'د. عماد شرماط', 'د. بن زيد يوسف', 'د. بطوش أميمة']
const latin = (n) => (/[A-Za-z]/.test(n) ? n : undefined)

const committees = [
  ...sci.map(([n, inst, ra, re], i) => doc('committee', `committee-sci-${String(i + 1).padStart(2, '0')}`, {
    committeeType: 'scientific', order: i + 1, name_ar: n, name_en: latin(n),
    role_ar: ra, role_en: re, institution_ar: inst, institution_en: INST[inst],
  })),
  ...org.map((n, i) => doc('committee', `committee-org-${String(i + 1).padStart(2, '0')}`, {
    committeeType: 'organizing', order: 11 + i, name_ar: n, institution_ar: 'جامعة سطيف 1', institution_en: INST['جامعة سطيف 1'],
  })),
]

const T = (ar, en) => ({text_ar: ar, text_en: en})
const withKeys = (p, a) => a.map((x, i) => ({_key: k(p, i), ...x}))

const tracks = [
  ['المحور الأول', 'Track 1', 'تشخيص الأمن الغذائي: أدوات التحليل الاقتصادي ومؤشرات القياس الدولية', 'Diagnosing Food Security: Economic Analysis Tools and International Measurement Indicators', 'chart', 'primary', [
    T('تطور مقاربات الأمن الغذائي في ظل أهداف التنمية المستدامة 2030.', 'Evolution of food security approaches in light of the 2030 Sustainable Development Goals.'),
    T('النماذج التحليلية ومؤشرات القياس الدولية للأمن الغذائي.', 'Analytical models and international food security measurement indicators.'),
    T('العلاقة بين الأمن الغذائي، الأمن الاقتصادي، والاستقرار الاجتماعي.', 'The relationship between food security, economic security and social stability.')]],
  ['المحور الثاني', 'Track 2', 'الصدمات العالمية وانعكاساتها على النظم الغذائية', 'Global Shocks and Their Impact on Food Systems', 'globe', 'secondary', [
    T('التوترات الجيوسياسية واضطرابات سلاسل الإمداد والتجارة الدولية.', 'Geopolitical tensions and disruptions to supply chains and international trade.'),
    T('التغيرات المناخية والكوارث الطبيعية وأثرها على استقرار الإنتاج الزراعي.', 'Climate change and natural disasters and their effect on agricultural production stability.'),
    T('تقلبات أسعار السلع الأساسية وتأثيرها على التضخم والقدرة الشرائية.', 'Staple commodity price volatility and its impact on inflation and purchasing power.'),
    T('تقييم مستويات الهشاشة البنيوية والتبعية الاستيرادية في الاقتصادات النامية.', 'Assessing structural fragility and import dependence in developing economies.')]],
  ['المحور الثالث', 'Track 3', 'السياسات الاقتصادية والتمويلية لتعزيز الاستقلالية الغذائية', 'Economic and Financing Policies for Strengthening Food Self-Reliance', 'coins', 'accent', [
    T('تقييم السياسات الزراعية والتجارية بين الحماية والتحرير وأثرها على الإنتاج المحلي.', 'Evaluating agricultural and trade policies between protection and liberalization and their effect on local production.'),
    T('إصلاح منظومة الدعم الغذائي بما يوازن بين الكفاءة الاقتصادية والعدالة الاجتماعية.', 'Reforming food subsidy systems to balance economic efficiency and social justice.'),
    T('آليات التمويل المبتكر والمستدام للقطاع الفلاحي، مثل التمويل الأخضر، الصكوك الإسلامية، ورأس المال المخاطر.', 'Innovative and sustainable financing mechanisms for agriculture, such as green finance, Islamic sukuk and venture capital.'),
    T('دور الشراكة بين القطاعين العام والخاص في تحديث البنى التحتية واللوجستية الزراعية.', 'The role of public-private partnerships in modernizing agricultural infrastructure and logistics.')]],
  ['المحور الرابع', 'Track 4', 'دور الابتكار والتحول الرقمي في استدامة سلاسل القيمة الغذائية', 'The Role of Innovation and Digital Transformation in Food Value Chain Sustainability', 'chip', 'blue', [
    T('الزراعة الذكية وتطبيقات الذكاء الاصطناعي وإنترنت الأشياء في رفع كفاءة الموارد.', 'Smart agriculture, artificial intelligence and Internet of Things applications for resource efficiency.'),
    T('التكنولوجيا الحيوية والتحسين الوراثي لمواجهة الإجهاد المناخي والمائي.', 'Biotechnology and genetic improvement to cope with climate and water stress.'),
    T('دور الرقمنة في تتبع سلاسل الإمداد، وإدارة التخزين، والحد من الفاقد والهدر الغذائي.', 'The role of digitalization in supply chain traceability, storage management and reducing food loss and waste.'),
    T('المقاولاتية والمؤسسات الناشئة في التكنولوجيا الزراعية (AgriTech) ودورها في تطوير الابتكار ضمن الصناعات التحويلية.', 'Entrepreneurship and AgriTech start-ups and their role in driving innovation in food processing industries.')]],
  ['المحور الخامس', 'Track 5', 'اقتصاديات البيئة وإدارة الموارد الطبيعية', 'Environmental Economics and Natural Resource Management', 'leaf', 'purple', [
    T('الانتقال نحو الاقتصاد الأخضر والاقتصاد الدائري في النظم الزراعية الغذائية.', 'Transition to the green and circular economy in agri-food systems.'),
    T('الحوكمة الاقتصادية للموارد المائية، بما يشمل الري الذكي، تحلية المياه، وإعادة التدوير.', 'Economic governance of water resources, including smart irrigation, desalination and recycling.'),
    T('التقييم الاقتصادي لآثار التصحر وتدهور الأراضي وسبل التخفيف منها.', 'Economic assessment of desertification and land degradation and mitigation measures.'),
    T('تثمين التنوع البيولوجي والموارد الوراثية كأداة لتعزيز المنعة الغذائية.', 'Valuing biodiversity and genetic resources as a tool for strengthening food resilience.')]],
  ['المحور السادس', 'Track 6', 'الحوكمة المؤسساتية والتجارب الدولية', 'Institutional Governance and International Experiences', 'book', 'gray', [
    T('الأطر المؤسسية وحوكمة القطاع الزراعي الغذائي وتكامل أدوار الحكومات، القطاع الخاص، والمجتمع المدني.', 'Institutional frameworks and governance of the agri-food sector, and the complementary roles of governments, the private sector and civil society.'),
    T('التكامل الاقتصادي الإقليمي ودوره في تعزيز الأمن الغذائي، مع الإشارة إلى منطقة التجارة الحرة القارية الإفريقية (ZLECAF) والمنطقة العربية.', 'Regional economic integration and its role in strengthening food security, with reference to the African Continental Free Trade Area (AfCFTA) and the Arab region.'),
    T('استعراض تجارب دولية رائدة في تحقيق السيادة الغذائية وبناء النظم المرنة والمستدامة.', 'Reviewing leading international experiences in achieving food sovereignty and building resilient, sustainable systems.'),
    T('دور مراكز البحث العلمي والمنظمات الدولية في توجيه السياسات العامة ونقل التكنولوجيا.', 'The role of research centers and international organizations in guiding public policy and transferring technology.')]],
].map(([kAr, kEn, tAr, tEn, icon, color, pts], i) => doc('track', `track-${i + 1}`, {
  order: i + 1, kicker_ar: kAr, kicker_en: kEn, title_ar: tAr, title_en: tEn, icon, color, topics: withKeys('t', pts),
}))

const objectives = [
  ['تحليل الأبعاد الاقتصادية الكلية والجيوسياسية والمناخية للأمن الغذائي، وقياس أثر الصدمات العالمية وتغيرات أنماط التجارة على استقرار الأسواق وسلاسل الإمداد الدولية.', 'Analyzing the macroeconomic, geopolitical and climatic dimensions of food security, and measuring the impact of global shocks and changing trade patterns on market stability and international supply chains.'],
  ['دراسة نجاعة السياسات الاقتصادية والزراعية والتجارية المعتمدة في الاقتصادات النامية، ولا سيما في المنطقة العربية والإفريقية، لتقليص التبعية للاستيراد ورصد الفجوات الهيكلية في حوكمة النظم الغذائية.', 'Studying the effectiveness of economic, agricultural and trade policies in developing economies, particularly in the Arab and African regions, to reduce import dependence and identify structural gaps in food system governance.'],
  ['استكشاف أثر التحول الرقمي والابتكار التكنولوجي، مثل الزراعة الذكية مناخيا، والذكاء الاصطناعي، والتكنولوجيا الحيوية، في تحديث سلاسل القيمة الغذائية من الإنتاج إلى التوزيع والاستهلاك.', 'Exploring the impact of digital transformation and technological innovation, such as climate-smart agriculture, artificial intelligence and biotechnology, on modernizing food value chains from production to distribution and consumption.'],
  ['مناقشة نماذج التمويل المبتكر للقطاعين الفلاحي والصناعي الغذائي، بما يشمل الشراكات بين القطاعين العام والخاص، والتمويل الأخضر، والتمويل الإسلامي، وأدوات التمويل الجماعي.', 'Discussing innovative financing models for agriculture and food industries, including public-private partnerships, green finance, Islamic finance and crowdfunding instruments.'],
  ['دراسة التجارب والنماذج العالمية الرائدة في تحقيق الاكتفاء والسيادة الغذائية وبناء منظومات مرنة، واستخلاص الدروس القابلة للتكييف مع السياقات الاقتصادية والمؤسساتية للدول النامية.', 'Studying leading global experiences in achieving food self-sufficiency and sovereignty and building resilient systems, and drawing lessons adaptable to the economic and institutional contexts of developing countries.'],
  ['تأسيس شبكة بحثية دولية متخصصة، وتوطيد التعاون المؤسسي بين الجامعات ومراكز البحث والقطاعين العام والخاص، لتسهيل نقل المعرفة والتكنولوجيا عبر سلسلة القيمة الغذائية.', 'Establishing a specialized international research network and strengthening institutional cooperation between universities, research centers and the public and private sectors to facilitate knowledge and technology transfer across the food value chain.'],
  ['صياغة توصيات علمية وعملية مبنية على الأدلة، موجهة لراسمي السياسات العمومية والفاعلين الاقتصاديين، للمساهمة في تصميم استراتيجيات وطنية وإقليمية متكاملة تضمن استدامة الأمن الغذائي.', 'Drafting evidence-based scientific and practical recommendations for public policy makers and economic actors, contributing to integrated national and regional strategies that ensure food security sustainability.'],
].map(([a, e], i) => ({_key: k('o', i), text_ar: a, text_en: e}))

const audience = withKeys('a', [
  T('الأساتذة الباحثون والباحثون في الاقتصاد، الإدارة، التجارة، المالية، الزراعة، البيئة، والتنمية المستدامة.', 'Professors and researchers in economics, management, trade, finance, agriculture, environment and sustainable development.'),
  T('طلبة الدكتوراه المهتمون بالأمن الغذائي، السياسات الاقتصادية، وسلاسل القيمة الغذائية.', 'Doctoral students interested in food security, economic policy and food value chains.'),
  T('ممثلو وزارة الفلاحة والتنمية الريفية والمؤسسات الحكومية ذات الصلة.', 'Representatives of the Ministry of Agriculture and Rural Development and relevant government institutions.'),
  T('إطارات ومهنيون في قطاعات الفلاحة، الصناعات الغذائية، البيئة، واللوجستيك.', 'Executives and professionals in agriculture, food industries, environment and logistics.'),
  T('ممثلو المنظمات الدولية المعنية بالأمن الغذائي والتنمية المستدامة.', 'Representatives of international organizations concerned with food security and sustainable development.'),
  T('فاعلون اقتصاديون ومقاولون في مجال الصناعات الغذائية والتكنولوجيا الزراعية، ومسؤولو غرف الفلاحة والتجارة.', 'Economic actors and entrepreneurs in food industries and agricultural technology, and officials of chambers of agriculture and commerce.'),
])

const aboutPage = doc('aboutPage', 'aboutPage', {
  aboutIntro_ar: 'تنظم كلية العلوم الاقتصادية والتجارية وعلوم التسيير بجامعة سطيف 1 – فرحات عباس سلسلة "المؤتمر الدولي للقضايا الاقتصادية المعاصرة (ICCEI)"، بوصفها فضاءً علميًا دوريًا يتناول في كل طبعة قضية اقتصادية راهنة ذات بعد دولي، ويجمع الأساتذة الباحثين والخبراء وصنّاع القرار والمهنيين من داخل الجزائر وخارجها.\n\nوقد خصصت الطبعة الأولى لاستخدامات الذكاء الاصطناعي في الخدمات المالية، فيما تتناول الطبعة الثانية قضية الأمن الغذائي في ظل التحديات العالمية، من زاوية الابتكار والسياسات الاقتصادية الكفيلة بتحقيق الاستدامة.',
  aboutIntro_en: 'The Faculty of Economics, Business and Management Sciences at Setif 1 University – Ferhat Abbas organizes the "International Conference on Contemporary Economic Issues (ICCEI)" series, a periodic scientific forum that addresses, in each edition, a current economic issue of international scope and brings together professors, researchers, experts, policy makers and professionals from Algeria and abroad.\n\nThe first edition was devoted to the uses of artificial intelligence in financial services, while the second edition addresses food security amid global challenges, from the perspective of innovation and the economic policies capable of achieving sustainability.',
  editionsTable: [
    {_key: 'e1', label_ar: 'الأولى', label_en: 'First', year: '2025', topic_ar: 'استخدامات الذكاء الاصطناعي في الخدمات المالية', topic_en: 'Uses of Artificial Intelligence in Financial Services'},
    {_key: 'e2', label_ar: 'الثانية', label_en: 'Second', year: '2027', topic_ar: 'الأمن الغذائي في ظل التحديات العالمية: الابتكار والسياسات الاقتصادية لتحقيق الاستدامة', topic_en: 'Food Security Amid Global Challenges: Innovation and Economic Policies for Sustainability'},
  ],
  preamble_ar: 'يشكل الأمن الغذائي متغيرا هيكليا محددا للاستقرار الاقتصادي والاجتماعي، وركيزة أساسية ضمن أجندة التنمية المستدامة. وتؤكد المؤشرات الدولية الحديثة اتساع فجوة الأمن الغذائي عالميا، حيث يعاني نحو 673 مليون شخص من نقص التغذية المزمن، فيما يواجه أكثر من 2.3 مليار شخص انعدام الأمن الغذائي بدرجات متفاوتة، بما يعكس اختلالات بنيوية في حوكمة النظم الغذائية ومسارات العرض والطلب العالميين.\n\nوتتعرض سلاسل الإمداد الغذائي لضغوط غير مسبوقة ناتجة عن تداخل النزاعات الجيوسياسية، والصدمات المناخية المتطرفة، والتقلبات الاقتصادية، واضطرابات التجارة الدولية. وتزداد حدة هذه الضغوط في الاقتصادات النامية، ولا سيما في المنطقتين الإفريقية والعربية، حيث تتداخل ندرة الموارد المائية، وتدهور الأراضي، والنمو الديموغرافي، والتبعية للواردات الغذائية، بما يرفع درجة الانكشاف أمام صدمات الأسعار وقيود الإمداد.\n\nوتتطلب معالجة هذه الاختلالات تجاوز المقاربات التقليدية نحو نماذج اقتصادية أكثر استدامة، ترتكز على الابتكار الزراعي، والتكنولوجيات الرقمية، والتمويل المستدام، وتحديث الحوكمة المؤسساتية. كما تستدعي بناء سياسات تجارية واستثمارية قادرة على رفع كفاءة استخدام الموارد، وتعزيز القدرات التخزينية والاستراتيجية، وتقليص فجوة العجز الغذائي على المستويين الوطني والإقليمي.\n\nوفي هذا السياق، وانسجاما مع أهداف التنمية المستدامة 2030 وتوجهات النظم الغذائية العالمية، تنظم كلية العلوم الاقتصادية والتجارية وعلوم التسيير بجامعة سطيف 1 فرحات عباس المؤتمر الدولي الثاني للقضايا الاقتصادية المعاصرة، بهدف استقطاب مساهمات علمية رصينة ومتعددة التخصصات، وتبادل الخبرات الدولية، وصياغة توصيات عملية تساعد راسمي السياسات والفاعلين الاقتصاديين على تصميم منظومات غذائية أكثر مرونة وكفاءة واستدامة.',
  preamble_en: 'Food security is a structural variable that determines economic and social stability and a cornerstone of the sustainable development agenda. Recent international indicators confirm a widening global food security gap: around 673 million people suffer from chronic undernourishment, while more than 2.3 billion face food insecurity to varying degrees, reflecting structural imbalances in the governance of food systems and in global supply and demand.\n\nFood supply chains are under unprecedented pressure from the combined effect of geopolitical conflicts, extreme climate shocks, economic volatility and disruptions to international trade. These pressures are sharper in developing economies, particularly in Africa and the Arab region, where water scarcity, land degradation, demographic growth and dependence on food imports converge, increasing exposure to price shocks and supply restrictions.\n\nAddressing these imbalances requires moving beyond traditional approaches toward more sustainable economic models built on agricultural innovation, digital technologies, sustainable finance and modernized institutional governance. It also calls for trade and investment policies able to improve resource-use efficiency, strengthen storage and strategic capacities, and narrow the food deficit at the national and regional levels.\n\nIn this context, and in line with the 2030 Sustainable Development Goals and global food system trends, the Faculty of Economics, Business and Management Sciences at Setif 1 University Ferhat Abbas organizes the Second International Conference on Contemporary Economic Issues, aiming to attract rigorous multidisciplinary scientific contributions, exchange international experience, and draft practical recommendations that help policy makers and economic actors design more resilient, efficient and sustainable food systems.',
  problemQuestion_ar: 'كيف يمكن تصميم وتنسيق أنظمة الابتكار والسياسات الاقتصادية لتعزيز مرونة، كفاءة واستدامة النظم الغذائية في مواجهة الاضطرابات العالمية المتزايدة والتحولات الهيكلية المؤثرة على الأمن الغذائي؟',
  problemQuestion_en: 'How can innovation systems and economic policies be designed and coordinated to strengthen the resilience, efficiency and sustainability of food systems in the face of growing global disruptions and structural shifts affecting food security?',
  objectives, audience,
  tracksIntro_ar: 'يتناول المؤتمر إشكالية الأمن الغذائي والاستدامة من خلال ستة محاور مترابطة تغطي الأبعاد النظرية والسياساتية والتكنولوجية والبيئية.',
  tracksIntro_en: 'The conference addresses food security and sustainability through six interrelated tracks covering the theoretical, policy, technological and environmental dimensions.',
  tracksNote_ar: 'تُرحّب اللجنة العلمية بالدراسات التطبيقية والقياسية ودراسات الحالة، ولا سيما تلك التي تتناول التجربة الجزائرية والسياقين العربي والإفريقي، إلى جانب الدراسات المقارنة للتجارب الدولية.',
  tracksNote_en: 'The Scientific Committee welcomes applied and econometric studies and case studies, especially those addressing the Algerian experience and the Arab and African contexts, as well as comparative studies of international experiences.',
})

const D = (n, date, icon, ar, en, lAr, lEn) => doc('importantDate', `date-${n}`, {order: n, date, icon, title_ar: ar, title_en: en, dateLabel_ar: lAr, dateLabel_en: lEn})
const dates = [
  D(1, '2026-11-15', 'calendar', 'فتح باب استقبال الأوراق البحثية', 'Opening of paper submission'),
  D(2, '2026-11-26', 'mail', 'آخر أجل لإرسال الملخصات', 'Abstract submission deadline'),
  D(3, '2026-12-03', 'mail', 'الرد على الملخصات', 'Notification on abstracts'),
  D(4, '2027-02-15', 'file', 'آخر أجل لإرسال الأوراق البحثية كاملة', 'Full paper submission deadline'),
  D(5, '2027-03-05', 'award', 'إعلان قرار اللجنة العلمية بقبول الأوراق', 'Scientific Committee decision on accepted papers'),
  D(6, '2027-04-05', 'calendar', 'نشر البرنامج النهائي للمؤتمر', 'Publication of the final conference program'),
  D(7, '2027-04-20', 'award', 'انعقاد المؤتمر', 'Conference dates', '20–21 أفريل 2027', '20–21 April 2027'),
]

const G = (a, e) => T(a, e)
const submissionPage = doc('submissionPage', 'submissionPage', {
  guidelines: withKeys('g', [
    G('أن تندرج الورقة البحثية ضمن أحد محاور المؤتمر.', 'The paper must fall under one of the conference tracks.'),
    G('أن تكون الورقة أصيلة، لم يسبق نشرها أو قبولها للنشر أو تقديمها في تظاهرات علمية أخرى.', 'The paper must be original, not previously published, accepted for publication or presented at other scientific events.'),
    G('تقبل الأوراق باللغة العربية أو الإنجليزية، مرفقة بملخصين بلغتين.', 'Papers are accepted in Arabic or English, accompanied by abstracts in two languages.'),
    G('ترسل الأوراق كاملة بصيغتي Word وPDF، ولا تُقبل الملفات المضغوطة.', 'Full papers are submitted in both Word and PDF formats; compressed files are not accepted.'),
    G('تكتب الأوراق العربية بخط Simplified Arabic حجم 14، والإنجليزية والفرنسية بخط Times New Roman حجم 12.', 'Arabic papers are typed in Simplified Arabic size 14; English and French papers in Times New Roman size 12.'),
    G('لا يتجاوز حجم الورقة 20 صفحة، وتُعتمد طريقة APA في التوثيق والإحالات.', 'Papers must not exceed 20 pages, and APA style is used for citations and references.'),
    G('تخضع جميع الأوراق لتحكيم علمي مزدوج مجهول الهوية، ولذا لا تدرج أسماء المؤلفين في متن الورقة.', 'All papers undergo double-blind peer review; therefore author names must not appear in the body of the paper.'),
    G('تعرض الأوراق المقبولة حضوريًا في مقر انعقاد المؤتمر.', 'Accepted papers are presented in person at the conference venue.'),
  ]),
  platformNote_ar: 'تُرسل الأوراق البحثية عبر المنصة الإلكترونية لجامعة سطيف 1.',
  platformNote_en: 'Papers are submitted through the electronic platform of Setif 1 University.',
  datesNote_ar: 'تنبيه: لن يُنظر في أي ورقة بحثية تصل بعد انقضاء هذه الآجال.',
  datesNote_en: 'Notice: no paper received after these deadlines will be considered.',
  participationIntro_ar: 'المشاركة في أشغال المؤتمر مجانية، ويستفيد أصحاب الأوراق المقبولة من:',
  participationIntro_en: 'Participation in the conference is free of charge, and authors of accepted papers benefit from:',
  benefits: withKeys('b', [
    G('شهادات المشاركة.', 'Participation certificates.'),
    G('وجبات الغداء واستراحات القهوة والنقل الداخلي خلال أيام المؤتمر.', 'Lunch, coffee breaks and local transport during the conference days.'),
    G('تبقى المصاريف الأخرى على عاتق المشاركين.', 'Other expenses remain the responsibility of participants.'),
  ]),
  publishing: withKeys('p', [
    G('تنشر الأوراق المقبولة كاملة في كتاب أعمال المؤتمر برقم دولي معياري (ISBN).', 'Accepted papers are published in full in the conference proceedings book with an ISBN.'),
    G('ترشَح أفضل الأوراق للنشر في أعداد خاصة من مجلات علمية محكمة، وفق إجراءات التحكيم المعتمدة لديها.', 'The best papers are nominated for publication in special issues of peer-reviewed journals, according to their review procedures.'),
    G('جائزة أفضل ورقة بحثية: شهادة تقديرية تمنح بناء على توصيات اللجنة العلمية.', 'Best paper award: a certificate of appreciation granted on the recommendation of the Scientific Committee.'),
  ]),
})

const announcementDates = doc('announcement', 'announcement-dates', {
  kind: 'periodic', pinned: false, popup: false, publishAt: '2026-11-03T00:00:00.000Z',
  title_ar: 'التواريخ المهمة للمشاركة في المؤتمر', title_en: 'Important dates for participation',
  body_ar: 'فتح باب استقبال الأوراق: 15 نوفمبر 2026.\nآخر أجل لإرسال الملخصات: 26 نوفمبر 2026.\nالرد على الملخصات: 03 ديسمبر 2026.\nآخر أجل لإرسال الأوراق كاملة: 15 فيفري 2027.\nإعلان قرار القبول: 05 مارس 2027.\nانعقاد المؤتمر: 20–21 أفريل 2027.',
  body_en: 'Opening of submissions: 15 November 2026.\nAbstract deadline: 26 November 2026.\nNotification on abstracts: 03 December 2026.\nFull paper deadline: 15 February 2027.\nAcceptance decision: 05 March 2027.\nConference: 20–21 April 2027.',
  linkUrl: 'https://events.univ-setif.dz/', linkLabel_ar: 'منصة إرسال الأوراق', linkLabel_en: 'Paper submission platform',
})

export const docxDocs = [aboutPage, submissionPage, ...tracks, ...dates]
// وثائق تُستورد عبر import-docx (تحل محل ما يطابق معرّفها فقط)
export const importDocs = [aboutPage, submissionPage, ...tracks, ...dates, ...committees, announcementDates]
export const committeeDocs = committees
export const announcementDocs = [announcementDates]

// حقول تُحدَّث على الوثائق القائمة دون المساس ببقية ما عدّلتَه (patch-settings.mjs)
export const settingsPatch = {
  siteTitle_ar: 'المؤتمر الدولي الثاني للقضايا الاقتصادية المعاصرة',
  siteTitle_en: '2nd International Conference on Contemporary Economic Issues (ICCEI)',
  theme_ar: 'الأمن الغذائي في ظل التحديات العالمية: الابتكار والسياسات الاقتصادية لتحقيق الاستدامة',
  theme_en: 'Food Security Amid Global Challenges: Innovation and Economic Policies for Sustainability',
  contactEmail: 'iccei2027.setif1@gmail.com',
  venueDescription_ar: 'كلية العلوم الاقتصادية والتجارية وعلوم التسيير، جامعة سطيف 1 – فرحات عباس، القطب الجامعي الباز، طريق الجزائر، سطيف، الجزائر.',
  venueDescription_en: 'Faculty of Economics, Business and Management Sciences, Setif 1 University – Ferhat Abbas, El Bez University Campus, Algiers Road, Setif, Algeria.',
  address_ar: 'جامعة سطيف 1 – فرحات عباس، القطب الجامعي الباز، طريق الجزائر، سطيف، الجزائر.',
  address_en: 'Setif 1 University – Ferhat Abbas, El Bez University Campus, Algiers Road, Setif, Algeria.',
  footerAbout_ar: 'المؤتمر الدولي الثاني للقضايا الاقتصادية المعاصرة: منبر علمي يجمع الباحثين والخبراء وصنّاع القرار لمناقشة الأمن الغذائي في ظل التحديات العالمية، من زاوية الابتكار والسياسات الاقتصادية لتحقيق الاستدامة.',
  footerAbout_en: 'The Second International Conference on Contemporary Economic Issues: a scientific forum bringing together researchers, experts and policy makers to discuss food security amid global challenges, from the angle of innovation and economic policies for sustainability.',
}
export const homePatch = {
  welcomeHeading_ar: 'منبر علمي دولي لقضايا الأمن الغذائي والاستدامة',
  welcomeHeading_en: 'An International Scientific Forum on Food Security and Sustainability',
  welcomeText_ar: 'يتناول المؤتمر الدولي الثاني للقضايا الاقتصادية المعاصرة قضية الأمن الغذائي في ظل التحديات العالمية، من زاوية الابتكار والسياسات الاقتصادية الكفيلة بتحقيق الاستدامة، ويجمع الأساتذة الباحثين والخبراء وصنّاع القرار والمهنيين من داخل الجزائر وخارجها.',
  welcomeText_en: 'The Second International Conference on Contemporary Economic Issues addresses food security amid global challenges, from the perspective of innovation and the economic policies capable of achieving sustainability, bringing together professors, researchers, experts, policy makers and professionals from Algeria and abroad.',
  stats: [
    {_key: 's1', value: '06', label_ar: 'محاور علمية', label_en: 'Scientific Tracks'},
    {_key: 's2', value: '02', label_ar: 'يومان من النقاش', label_en: 'Days of Discussion'},
  ],
}
