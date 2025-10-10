import { RecitationAnalysis } from '../types';

export const recitationAnalysisData: RecitationAnalysis[] = [
    // Surah Al-Fatihah (1)
    {
        surahId: 1,
        ayahNumber: 1,
        text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        tajweedAnalysis: [
            { word: "اللَّهِ", rule: "تفخيم لام لفظ الجلالة", explanation: "تُفخَّم لام لفظ الجلالة لأنها سُبقت بفتح (في كلمة بِسْمِ)." },
            { word: "الرَّحْمَٰنِ", rule: "مد طبيعي", explanation: "يوجد مد طبيعي في الألف الخنجرية بعد الميم، ويمد بمقدار حركتين." },
            { word: "الرَّحِيمِ", rule: "مد عارض للسكون", explanation: "عند الوقف على كلمة 'الرَّحِيمِ'، يتحول المد الطبيعي في الياء إلى مد عارض للسكون، يجوز مده 2 أو 4 أو 6 حركات." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    {
        surahId: 1,
        ayahNumber: 2,
        text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        tajweedAnalysis: [
            { word: "الْحَمْدُ", rule: "إظهار اللام القمرية", explanation: "اللام في 'الْحَمْدُ' هي لام قمرية، حكمها الإظهار، وتنطق بوضوح." },
            { word: "لِلَّهِ", rule: "ترقيق لام لفظ الجلالة", explanation: "تُرقَّق لام لفظ الجلالة لأنها سُبقت بكسر." },
            { word: "الْعَالَمِينَ", rule: "مد عارض للسكون", explanation: "عند الوقف، تمد الياء بمقدار 2 أو 4 أو 6 حركات." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    {
        surahId: 1,
        ayahNumber: 3,
        text: "الرَّحْمَٰنِ الرَّحِيمِ",
        tajweedAnalysis: [
            { word: "الرَّحْمَٰنِ", rule: "إدغام شمسي", explanation: "اللام في 'الر' لا تنطق وتدغم في الراء." },
            { word: "الرَّحِيمِ", rule: "مد عارض للسكون", explanation: "عند الوقف، تمد الياء بمقدار 2 أو 4 أو 6 حركات." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    {
        surahId: 1,
        ayahNumber: 4,
        text: "مَالِكِ يَوْمِ الدِّينِ",
        tajweedAnalysis: [
             { word: "مَالِكِ", rule: "مد طبيعي", explanation: "تمد الألف بعد الميم حركتين." },
             { word: "الدِّينِ", rule: "مد عارض للسكون", explanation: "عند الوقف، تمد الياء بمقدار 2 أو 4 أو 6 حركات." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    {
        surahId: 1,
        ayahNumber: 5,
        text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        tajweedAnalysis: [
            { word: "إِيَّاكَ", rule: "مد طبيعي", explanation: "تمد الياء الأولى حركتين." },
            { word: "نَسْتَعِينُ", rule: "مد عارض للسكون", explanation: "عند الوقف، تمد الياء بمقدار 2 أو 4 أو 6 حركات." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    {
        surahId: 1,
        ayahNumber: 6,
        text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
        tajweedAnalysis: [
            { word: "الصِّرَاطَ", rule: "تفخيم الطاء", explanation: "الطاء من حروف التفخيم." },
            { word: "الْمُسْتَقِيمَ", rule: "مد عارض للسكون", explanation: "عند الوقف، تمد الياء بمقدار 2 أو 4 أو 6 حركات." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    {
        surahId: 1,
        ayahNumber: 7,
        text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
        tajweedAnalysis: [
            { word: "أَنْعَمْتَ", rule: "إظهار حلقي", explanation: "النون الساكنة بعدها عين، حكمها الإظهار." },
            { word: "عَلَيْهِمْ غَيْرِ", rule: "إظهار شفوي", explanation: "الميم الساكنة بعدها غين، حكمها الإظهار." },
            { word: "الضَّالِّينَ", rule: "مد لازم كلمي مثقل", explanation: "حرف المد (الألف) بعده حرف مشدد (اللام)، ويمد 6 حركات." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    // Surah Al-Baqarah (2) - Specific Ayahs
    {
        surahId: 2,
        ayahNumber: 1,
        text: "الٓمٓ",
        tajweedAnalysis: [
            { word: "الٓمٓ", rule: "مد لازم حرفي مثقل ومخفف", explanation: "ألف: لا مد فيها. لام: مد لازم حرفي مثقل (6 حركات) لوجود الإدغام مع الميم. ميم: مد لازم حرفي مخفف (6 حركات)." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    {
        surahId: 2,
        ayahNumber: 2,
        text: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ",
        tajweedAnalysis: [
            { word: "رَيْبَ", rule: "مد لين", explanation: "ياء ساكنة مفتوح ما قبلها." },
            { word: "هُدًى لِّلْمُتَّقِينَ", rule: "إدغام كامل بغير غنة", explanation: "التنوين بعده لام، حكمه الإدغام الكامل بغير غنة." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    {
        surahId: 2,
        ayahNumber: 3,
        text: "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ",
        tajweedAnalysis: [
            { word: "رَزَقْنَاهُمْ", rule: "قلقلة صغرى", explanation: "القاف ساكنة في وسط الكلمة." },
            { word: "يُنفِقُونَ", rule: "إخفاء حقيقي", explanation: "نون ساكنة بعدها فاء، حكمها الإخفاء بغنة." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    {
        surahId: 2,
        ayahNumber: 4,
        text: "وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ",
        tajweedAnalysis: [
            { word: "أُنزِلَ", rule: "إخفاء حقيقي", explanation: "نون ساكنة بعدها زاي، حكمها الإخفاء بغنة." },
            { word: "مِن قَبْلِكَ", rule: "إخفاء حقيقي وقلقلة صغرى", explanation: "نون ساكنة بعدها قاف (إخفاء)، وباء ساكنة (قلقلة)." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    {
        surahId: 2,
        ayahNumber: 5,
        text: "أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ",
        tajweedAnalysis: [
            { word: "أُولَٰئِكَ", rule: "مد واجب متصل", explanation: "حرف المد والهمزة في كلمة واحدة، يمد 4-5 حركات." },
            { word: "هُدًى مِّن", rule: "إدغام كامل بغنة", explanation: "تنوين بعده ميم، حكمه الإدغام." },
            { word: "مِّن رَّبِّهِمْ", rule: "إدغام كامل بغير غنة", explanation: "نون ساكنة بعدها راء، حكمه الإدغام." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    {
        surahId: 2,
        ayahNumber: 255,
        text: "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ",
        tajweedAnalysis: [
            { word: "لَآ إِلَٰهَ", rule: "مد جائز منفصل", explanation: "حرف المد (الألف) في آخر كلمة 'لَا' والهمزة في أول الكلمة التالية 'إِلَٰهَ'. يمد بمقدار 4 أو 5 حركات." },
            { word: "ٱلْقَيُّومُ", rule: "إظهار قمري", explanation: "اللام في 'ٱلْ' هي لام قمرية، حكمها الإظهار." },
            { word: "سِنَةٌ وَلَا", rule: "إدغام بغنة", explanation: "تنوين الضم في 'سِنَةٌ' جاء بعده حرف الواو، وهو من حروف الإدغام بغنة." },
            { word: "نَوْمٌ ۚ لَّهُۥ", rule: "إدغام كامل بغير غنة", explanation: "عند الوصل، تنوين الضم في 'نَوْمٌ' يأتي بعده حرف اللام، فيدغم التنوين في اللام إدغامًا كاملاً بدون غنة." },
            { word: "مَن ذَا", rule: "إخفاء حقيقي", explanation: "نون ساكنة جاء بعدها حرف الذال، وهو من حروف الإخفاء. تُخفى النون مع غنة." },
            { word: "عِندَهُۥٓ", rule: "إخفاء حقيقي ومد صلة كبرى", explanation: "نون ساكنة جاء بعدها حرف الدال (إخفاء)، وهاء الضمير بعدها همزة (مد صلة كبرى يمد 4-5 حركات)." },
            { word: "بِشَىْءٍ مِّنْ", rule: "إدغام بغنة", explanation: "تنوين الكسر في 'بِشَىْءٍ' جاء بعده حرف الميم، فيدغم التنوين في الميم مع غنة." },
            { word: "مِّنْ عِلْمِهِۦٓ", rule: "إظهار حلقي ومد صلة كبرى", explanation: "نون ساكنة بعدها عين (إظهار)، وهاء الضمير بعدها همزة (مد صلة كبرى)." },
            { word: "شَآءَ", rule: "مد واجب متصل", explanation: "حرف المد (الألف) والهمزة جاءا في كلمة واحدة. يمد بمقدار 4 أو 5 حركات." },
            { word: "يَـُٔودُهُۥ", rule: "مد بدل ومد صلة صغرى", explanation: "همزة ممدودة (مد بدل حركتين)، وهاء الضمير لم يأت بعدها همزة (مد صلة صغرى حركتين)." },
            { word: "ٱلْعَظِيمُ", rule: "مد عارض للسكون", explanation: "عند الوقف على الكلمة، تمد الياء بمقدار 2 أو 4 أو 6 حركات." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    {
        surahId: 2,
        ayahNumber: 285,
        text: "آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ",
        tajweedAnalysis: [
            { word: "آمَنَ", rule: "مد بدل", explanation: "كل همزة ممدودة هي مد بدل، ويمد بمقدار حركتين." },
            { word: "بِمَا أُنزِلَ", rule: "مد جائز منفصل", explanation: "حرف المد في كلمة والهمزة في كلمة تالية، يمد 4-5 حركات." },
            { word: "أُنزِلَ", rule: "إخفاء حقيقي", explanation: "نون ساكنة بعدها زاي، وهو من حروف الإخفاء." },
            { word: "مِن رَّبِّهِ", rule: "إدغام كامل بغير غنة", explanation: "نون ساكنة بعدها راء." },
            { word: "كُلٌّ آمَنَ", rule: "إظهار حلقي", explanation: "تنوين بعده همزة، حكمه الإظهار." },
            { word: "أَحَدٍ مِّن", rule: "إدغام بغنة", explanation: "تنوين بعده ميم، حكمه الإدغام مع غنة." },
            { word: "الْمَصِيرُ", rule: "مد عارض للسكون", explanation: "عند الوقف، تمد الياء 2 أو 4 أو 6 حركات." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    {
        surahId: 2,
        ayahNumber: 286,
        text: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
        tajweedAnalysis: [
            { word: "نَفْسًا إِلَّا", rule: "إظهار حلقي", explanation: "تنوين بعده همزة، حكمه الإظهار." },
            { word: "أَخْطَأْنَا", rule: "قلقلة صغرى", explanation: "الطاء ساكنة في وسط الكلمة، وهي من حروف القلقلة." },
            { word: "إِصْرًا كَمَا", rule: "إخفاء حقيقي", explanation: "تنوين بعده كاف، حكمه الإخفاء مع غنة." },
            { word: "مِن قَبْلِنَا", rule: "إخفاء حقيقي وقلقلة صغرى", explanation: "نون ساكنة بعدها قاف (إخفاء)، وباء ساكنة (قلقلة)." },
            { word: "عَنَّا", rule: "غنة النون المشددة", explanation: "تغن النون المشددة بمقدار حركتين." },
            { word: "وَارْحَمْنَا", rule: "تفخيم الراء", explanation: "الراء ساكنة وما قبلها مفتوح، فتفخم." },
            { word: "أَنتَ", rule: "إخفاء حقيقي", explanation: "نون ساكنة بعدها تاء." },
            { word: "فَانصُرْنَا", rule: "إخفاء حقيقي", explanation: "نون ساكنة بعدها صاد." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    // Juz Amma Starts Here
    // Surah An-Naba (78)
    {
        surahId: 78,
        ayahNumber: 1,
        text: "عَمَّ يَتَسَاءَلُونَ",
        tajweedAnalysis: [
            { word: "عَمَّ", rule: "غنة الميم المشددة", explanation: "تغن الميم المشددة بمقدار حركتين." },
            { word: "يَتَسَاءَلُونَ", rule: "مد واجب متصل ومد عارض للسكون", explanation: "مد متصل في 'سَاء' (4-5 حركات)، ومد عارض للسكون عند الوقف." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    // ... Continue for all of Juz Amma ...
    // Surah An-Nazi'at (79)
    {
        surahId: 79,
        ayahNumber: 1,
        text: "وَالنَّازِعَاتِ غَرْقًا",
        tajweedAnalysis: [
            { word: "وَالنَّازِعَاتِ", rule: "غنة النون المشددة", explanation: "تغن النون المشددة بمقدار حركتين." },
            { word: "غَرْقًا", rule: "إظهار حلقي عند الوصل", explanation: "التنوين بعده حرف من حروف الإظهار في الآية التالية (همزة 'وَالنَّاشِطَاتِ')." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    // Surah Abasa (80)
    {
        surahId: 80,
        ayahNumber: 1,
        text: "عَبَسَ وَتَوَلَّىٰ",
        tajweedAnalysis: [
             { word: "وَتَوَلَّىٰ", rule: "مد طبيعي", explanation: "مد طبيعي في الألف المقصورة في آخر الكلمة." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    // ... up to ...
    // Surah Al-Ikhlas (112)
    {
        surahId: 112,
        ayahNumber: 1,
        text: "قُلْ هُوَ اللَّهُ أَحَدٌ",
        tajweedAnalysis: [
            { word: "قُلْ", rule: "إظهار اللام الساكنة", explanation: "اللام في 'قُلْ' هي لام الفعل وحكمها الإظهار." },
            { word: "اللَّهُ", rule: "تفخيم لام لفظ الجلالة", explanation: "تُفخَّم لام لفظ الجلالة لأنها سُبقت بفتح (في الواو من 'هُوَ')." },
            { word: "أَحَدٌ", rule: "قلقلة كبرى", explanation: "عند الوقف على الدال في 'أَحَدٌ'، تكون القلقلة كبرى." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    {
        surahId: 112,
        ayahNumber: 2,
        text: "اللَّهُ الصَّمَدُ",
        tajweedAnalysis: [
            { word: "الصَّمَدُ", rule: "إدغام شمسي وقلقلة كبرى", explanation: "اللام تدغم في الصاد. وعند الوقف، الدال تقلقل قلقلة كبرى." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    {
        surahId: 112,
        ayahNumber: 3,
        text: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
        tajweedAnalysis: [
            { word: "يَلِدْ", rule: "قلقلة كبرى عند الوقف", explanation: "الدال في آخر الكلمة تقلقل." },
            { word: "وَلَمْ يُولَدْ", rule: "إظهار شفوي وقلقلة كبرى عند الوقف", explanation: "الميم الساكنة بعدها ياء (إظهار). والدال في آخر الكلمة تقلقل." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    {
        surahId: 112,
        ayahNumber: 4,
        text: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
        tajweedAnalysis: [
            { word: "يَكُن لَّهُ", rule: "إدغام كامل بغير غنة", explanation: "نون ساكنة بعدها لام." },
            { word: "كُفُوًا أَحَدٌ", rule: "إظهار حلقي", explanation: "التنوين بعده همزة، حكمه الإظهار." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    // Surah Al-Falaq (113)
    {
        surahId: 113,
        ayahNumber: 1,
        text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
        tajweedAnalysis: [
            { word: "الْفَلَقِ", rule: "قلقلة كبرى عند الوقف", explanation: "القاف في آخر الكلمة تقلقل قلقلة كبرى عند الوقف عليها." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    {
        surahId: 113,
        ayahNumber: 2,
        text: "مِن شَرِّ مَا خَلَقَ",
        tajweedAnalysis: [
             { word: "مِن شَرِّ", rule: "إخفاء حقيقي", explanation: "نون ساكنة بعدها شين، حكمها الإخفاء بغنة." },
             { word: "خَلَقَ", rule: "قلقلة كبرى عند الوقف", explanation: "القاف في آخر الكلمة تقلقل." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    {
        surahId: 113,
        ayahNumber: 3,
        text: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
        tajweedAnalysis: [
            { word: "غَاسِقٍ إِذَا", rule: "إظهار حلقي", explanation: "تنوين بعده همزة." },
            { word: "وَقَبَ", rule: "قلقلة كبرى عند الوقف", explanation: "الباء في آخر الكلمة تقلقل." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    {
        surahId: 113,
        ayahNumber: 4,
        text: "وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ",
        tajweedAnalysis: [
             { word: "ٱلنَّفَّٰثَٰتِ", rule: "غنة النون المشددة", explanation: "النون مشددة تغن حركتين." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    {
        surahId: 113,
        ayahNumber: 5,
        text: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
        tajweedAnalysis: [
             { word: "حَاسِدٍ إِذَا", rule: "إظهار حلقي", explanation: "تنوين بعده همزة." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    // Surah An-Nas (114)
    {
        surahId: 114,
        ayahNumber: 1,
        text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
        tajweedAnalysis: [
            { word: "النَّاسِ", rule: "غنة النون المشددة ومد عارض للسكون", explanation: "النون مشددة تغن حركتين، وعند الوقف، الألف تمد مدًا عارضًا للسكون." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    {
        surahId: 114,
        ayahNumber: 2,
        text: "مَلِكِ النَّاسِ",
        tajweedAnalysis: [
            { word: "النَّاسِ", rule: "غنة النون المشددة ومد عارض للسكون", explanation: "تكرار لنفس أحكام الآية الأولى." }
        ],
        testPoints: { positive: [], negative: [] }
    },
     {
        surahId: 114,
        ayahNumber: 3,
        text: "إِلَٰهِ ٱلنَّاسِ",
        tajweedAnalysis: [
            { word: "ٱلنَّاسِ", rule: "غنة النون المشددة", explanation: "النون مشددة تغن حركتين." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    {
        surahId: 114,
        ayahNumber: 4,
        text: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ",
        tajweedAnalysis: [
            { word: "مِن شَرِّ", rule: "إخفاء حقيقي", explanation: "نون ساكنة بعدها شين." },
            { word: "الْخَنَّاسِ", rule: "غنة النون المشددة", explanation: "النون مشددة تغن حركتين." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    {
        surahId: 114,
        ayahNumber: 5,
        text: "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ",
        tajweedAnalysis: [
            { word: "ٱلنَّاسِ", rule: "غنة النون المشددة", explanation: "النون مشددة تغن حركتين." }
        ],
        testPoints: { positive: [], negative: [] }
    },
    {
        surahId: 114,
        ayahNumber: 6,
        text: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
        tajweedAnalysis: [
            { word: "ٱلْجِنَّةِ", rule: "غنة النون المشددة", explanation: "النون مشددة تغن حركتين." },
            { word: "وَٱلنَّاسِ", rule: "غنة النون المشددة", explanation: "النون مشددة تغن حركتين." }
        ],
        testPoints: { positive: [], negative: [] }
    }
    // Note: This is a representative sample. A full implementation would contain all ayahs of Juz Amma.
];