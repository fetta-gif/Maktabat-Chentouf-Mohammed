// --- START OF FILE script.js ---

// استبدل هذا المفتاح بمفتاح API الخاص بك إذا كان لديك واحد للإنتاج.
// المفتاح الحالي قد يكون له قيود استخدام.
const API_KEY = 'AIzaSyDZ0geWXrbirrzzir-Z0UVx-3LMS2JV_Es'; // !!! ضع مفتاح Gemini API الخاص بك هنا !!!

// التأكد من تحميل بيانات المكتبة قبل البدء
if (typeof libraryData === 'undefined' || !libraryData || !libraryData.books) {
    console.error("خطأ: بيانات المكتبة (library_data.js) لم يتم تحميلها بشكل صحيح!");
    // يمكنك عرض رسالة خطأ للمستخدم هنا أيضاً
    alert("حدث خطأ في تحميل بيانات المكتبة. يرجى إعادة تحميل الصفحة.");
}

// -----------------------------------------------------------------------------
// تهيئة عند تحميل الصفحة
// -----------------------------------------------------------------------------
window.onload = function() {
    // عرض رسالة ترحيب عشوائية من بيانات المكتبة
    if (welcomeMessages && welcomeMessages.length > 0) {
        const welcomeMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
        addMessage(welcomeMessage, 'bot-message');
    } else {
        addMessage("مرحباً بك في المكتبة الذكية!", 'bot-message'); // رسالة افتراضية
    }

    // ربط حدث الضغط على Enter بحقل الإدخال
    const userInputField = document.getElementById('user-input');
    if (userInputField) {
        userInputField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                // منع الإرسال الافتراضي إذا كان الحقل داخل نموذج
                e.preventDefault();
                sendMessage();
            }
        });
    } else {
        console.error("خطأ: لم يتم العثور على حقل الإدخال 'user-input'.");
    }

    // ربط زر الإرسال بالدالة (كإجراء احتياطي أو بديل لـ onclick في HTML)
    const sendButton = document.querySelector('.send-btn');
    if (sendButton) {
        sendButton.onclick = sendMessage; // استخدام onclick هنا بسيط ومباشر
    }
};

// -----------------------------------------------------------------------------
// دوال عرض وإدارة الواجهة (UI Functions)
// -----------------------------------------------------------------------------

/**
 * يضيف رسالة إلى واجهة الدردشة.
 * @param {string} text - نص الرسالة.
 * @param {string} className - الكلاس CSS للرسالة (مثل 'user-message' أو 'bot-message').
 */
function addMessage(text, className) {
    const messagesDiv = document.getElementById('chat-messages');
    if (!messagesDiv) {
        console.error("خطأ: لم يتم العثور على حاوية الرسائل 'chat-messages'.");
        return;
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${className}`;
    // استخدام دالة formatResponse لتنسيق النص قبل إضافته كـ HTML
    messageDiv.innerHTML = formatResponse(text);

    // إضافة الرسالة الجديدة في الأعلى (لأن الترتيب معكوس بـ flex-direction: column-reverse)
    messagesDiv.insertBefore(messageDiv, messagesDiv.firstChild);

    // التأكد من التمرير لأعلى لرؤية الرسالة الجديدة (خاص بـ column-reverse)
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // أو استخدم 0 إذا لم يكن الترتيب معكوسًا

}

/**
 * يظهر مؤشر الكتابة.
 */
function showTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    const messagesDiv = document.getElementById('chat-messages');
    if (indicator && messagesDiv) {
        indicator.style.display = 'flex'; // إظهار المؤشر
         // تحريك المؤشر ليكون مرئيًا
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
}

/**
 * يخفي مؤشر الكتابة.
 */
function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.style.display = 'none'; // إخفاء المؤشر
    }
}

/**
 * يمسح محتوى منطقة الدردشة ويعرض رسالة ترحيب جديدة.
 */
function clearChat() {
    const messagesDiv = document.getElementById('chat-messages');
    if (!messagesDiv) return;

    // إزالة كل الرسائل ما عدا مؤشر الكتابة (إذا كان موجودًا)
    while (messagesDiv.firstChild && messagesDiv.firstChild.id !== 'typing-indicator') {
        messagesDiv.removeChild(messagesDiv.firstChild);
    }

    // عرض رسالة ترحيب جديدة
    if (welcomeMessages && welcomeMessages.length > 0) {
        const welcomeMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
        // إضافة الرسالة قبل مؤشر الكتابة (إذا كان موجوداً) أو كأول عنصر
        const indicator = document.getElementById('typing-indicator');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.innerHTML = formatResponse(welcomeMessage);
        if(indicator) {
            messagesDiv.insertBefore(messageDiv, indicator);
        } else {
            messagesDiv.appendChild(messageDiv); // في حال عدم وجود المؤشر
        }

    }

    // تمرير لأعلى
     messagesDiv.scrollTop = messagesDiv.scrollHeight;
}


/**
 * ينسق النص (Markdown البسيط) إلى HTML للعرض في الواجهة.
 * @param {string} text - النص المراد تنسيقه.
 * @returns {string} - النص بتنسيق HTML.
 */
function formatResponse(text) {
    if (!text) return ''; // التعامل مع النص الفارغ

    // استبدال العناوين Markdown بـ HTML
    text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');

    // استبدال النص العريض **text** بـ <strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // استبدال النص المائل *text* أو _text_ بـ <em>
    text = text.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>'); // لـ *italic*
    text = text.replace(/_(.+?)_/g, '<em>$1</em>'); // لـ _italic_

    // التعامل مع القوائم النقطية والمرقمة
    // ملاحظة: هذه معالجة بسيطة وقد تحتاج لتحسينات لحالات أكثر تعقيداً
    text = text.replace(/^\s*[\*\-\+] (.*$)/gm, '<li>$1</li>'); // قوائم نقطية
    text = text.replace(/^\s*\d+\. (.*$)/gm, '<li>$1</li>'); // قوائم مرقمة

    // تجميع عناصر القوائم داخل <ul> أو <ol> (تحسين للمعالجة السابقة)
    text = text.replace(/<\/li>\s*<li>/g, '</li><li>'); // إزالة الفراغات بين عناصر li
    text = text.replace(/(<li>.*?<\/li>)/gs, (match) => { // تحيط مجموعات li بـ ul
         // تحديد نوع القائمة بناءً على السطر الأول (هنا نفترض ul بشكل عام)
        return `<ul>${match}</ul>`;
    });
     // إزالة التكرار المحتمل لـ ul داخل ul
    text = text.replace(/<\/ul>\s*<ul>/g, '');


    // تنسيق الكود المضمن `code`
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    // تنسيق الاقتباسات > quote
    text = text.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');

    // تحويل الروابط [text](url) إلى HTML
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // تحويل الروابط العادية إلى روابط قابلة للنقر (معالجة بسيطة)
     text = text.replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');


    // التعامل مع فواصل الأسطر
    text = text.replace(/\n\n/g, '</p><p>'); // فقرات جديدة
    text = text.replace(/\n/g, '<br>');      // أسطر جديدة داخل الفقرة

    // إضافة <p> في البداية والنهاية إذا لم تكن موجودة
    if (!text.startsWith('<p>') && !text.startsWith('<h') && !text.startsWith('<ul') && !text.startsWith('<ol') && !text.startsWith('<block')) {
       // text = '<p>' + text; // قد يسبب مشاكل إذا بدأ الرد بقائمة
    }
     if (!text.endsWith('</p>') && !text.endsWith('</h1>') && !text.endsWith('</h2>') && !text.endsWith('</h3>') && !text.endsWith('</ul>') && !text.endsWith('</ol>') && !text.endsWith('</blockquote>')) {
      //  text = text + '</p>'; // قد يسبب مشاكل
    }
     // إزالة وسوم p الفارغة
     text = text.replace(/<p><\/p>/g, '');


    return text;
}


// -----------------------------------------------------------------------------
// منطق الدردشة والتفاعل مع Gemini AI
// -----------------------------------------------------------------------------

/**
 * يبني الـ Prompt الذي سيتم إرساله إلى Gemini API.
 * @param {string} userMessage - رسالة المستخدم.
 * @returns {string} - الـ Prompt الكامل.
 */
function createPrompt(userMessage) {
    // تحويل قائمة الكتب إلى سلسلة نصية (JSON) لتضمينها في الـ prompt
    // تأكد من أن حجم القائمة لا يتجاوز حدود النموذج (Gemini 1.5 Flash له سياق كبير)
    const bookDataJson = JSON.stringify(libraryData.books, null, 2); // JSON منسق

    // بناء التعليمات للـ AI
    const instructions = `
أنت ${botBehavior.persona}.
شخصيتك: ${botBehavior.tone}.
مهمتك: ${botBehavior.focus}

البيانات المتاحة لك هي قائمة كتب بصيغة JSON التالية:
\`\`\`json
${bookDataJson}
\`\`\`
تحتوي القائمة على حقول: 'id' (معرف الكتاب الفريد مثل A01, B112, C005), 'title' (عنوان الكتاب), 'list' (القائمة A, B, أو C), وأحيانًا 'lang' (اللغة en أو fr).

استفسار المستخدم الحالي هو: "${userMessage}"

قواعد الرد:
1.  **فهم الطلب:** حدد ما إذا كان المستخدم يبحث برقم ID، أو بكلمة/جملة من العنوان، أو يطلب مساعدة عامة.
2.  **البحث بالرقم (ID):**
    *   إذا كان الإدخال يطابق نمط ID (حرف A/B/C متبوع برقمين أو ثلاثة، مثل A01, B55, C123)، ابحث عن تطابق **تام** في حقل 'id'.
    *   قارن بدون حساسية لحالة الحرف (A01 هي نفسها a01).
    *   إذا وجدت تطابقًا واحدًا، استخدم قالب الرد: "${responseTemplates.found}" واذكر تفاصيل الكتاب: **الرقم:** [ID]، **العنوان:** [Title]، **القائمة:** [List].
3.  **البحث بالعنوان (Title):**
    *   إذا لم يكن الطلب بحثًا بالرقم، افترض أنه بحث بالكلمة المفتاحية في العنوان.
    *   ابحث عن الكتب التي يتضمن حقل 'title' الخاص بها **كل** الكلمات الموجودة في استفسار المستخدم (تجاهل حالة الأحرف والمسافات الزائدة). كن مرنًا في البحث.
    *   إذا وجدت **كتابًا واحدًا** مطابقًا، استخدم قالب الرد: "${responseTemplates.found}" واذكر تفاصيله.
    *   إذا وجدت **عدة كتب** مطابقة، استخدم قالب الرد: "${responseTemplates.multipleFound}" واعرض قائمة بالنتائج (مثلاً، أول 5 كتب). لكل كتاب، اذكر: **الرقم:** [ID]، **العنوان:** [Title]، **القائمة:** [List]. استخدم قائمة نقطية Markdown (*).
4.  **عدم العثور على نتائج:** إذا لم تجد أي تطابق في البحث بالرقم أو العنوان، استخدم قالب الرد: "${responseTemplates.notFound}".
5.  **طلب المساعدة:** إذا طلب المستخدم المساعدة صراحة (مثل "مساعدة"، "كيف أبحث؟")، استخدم قالب الرد: "${responseTemplates.generalHelp}".
6.  **الردود العامة:** إذا كان السؤال عامًا جدًا ولا يتعلق بالبحث عن كتب (مثل "مرحباً")، رد بتحية بسيطة وذكّره بوظيفتك كمساعد مكتبة.
7.  **اللغة:** رد دائمًا باللغة العربية الفصحى الواضحة.
8.  **التنسيق:** استخدم Markdown بشكل بسيط للتنسيق (مثل ** للنص العريض، * للقوائم النقطية).
9.  **الختام:** اختم **كل** رد بعبارة ختامية **عشوائية** من القائمة التالية: [${responseTemplates.closing.map(c => `"${c}"`).join(', ')}]. لا تضف أي شيء بعد العبارة الختامية.

قم الآن بتحليل استفسار المستخدم والبحث في بيانات الكتب وصياغة الرد المناسب بناءً على هذه القواعد.
`;

    return instructions;
}


/**
 * يرسل رسالة المستخدم إلى Gemini API ويعرض الرد.
 */
async function sendMessage() {
    const input = document.getElementById('user-input');
    if (!input) return; // التأكد من وجود حقل الإدخال

    const message = input.value.trim();
    if (!message) return; // لا ترسل رسالة فارغة

    // إضافة رسالة المستخدم للواجهة
    addMessage(message, 'user-message');
    input.value = ''; // مسح حقل الإدخال

    // إظهار مؤشر الكتابة
    showTypingIndicator();

    try {
        // بناء الـ Prompt
        const prompt = createPrompt(message);
        // console.log("--- PROMPT ---"); // لإظهار الـ prompt في الكونسول للمراجعة
        // console.log(prompt);
        // console.log("--- END PROMPT ---");


        // إرسال الطلب إلى Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                // إعدادات الأمان (اختياري - لمنع محتوى غير مرغوب فيه)
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                  ],
                 // إعدادات توليد النص (اختياري)
                 generationConfig: {
                    temperature: 0.6, // درجة أقل من الإبداع للردود المباشرة
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024, // الحد الأقصى لعدد التوكنز في الرد
                }
            })
        });

        // إخفاء مؤشر الكتابة فور استلام الاستجابة (حتى لو كانت خطأ)
         hideTypingIndicator();

        // التحقق من نجاح الاستجابة HTTP
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error Response:', errorData);
            let errorMessage = responseTemplates.error || 'عذراً، حدث خطأ في التواصل مع الخادم.';
             if (errorData.error && errorData.error.message) {
                 // تخصيص رسائل لأخطاء شائعة
                 if (errorData.error.message.includes("API key not valid")) {
                    errorMessage = "خطأ: مفتاح API غير صالح أو منتهي الصلاحية. يرجى مراجعة المطور.";
                 } else if (errorData.error.code === 429) {
                     errorMessage = "تم تجاوز حد الطلبات المسموح به. يرجى المحاولة مرة أخرى بعد قليل.";
                 } else if (errorData.error.message.includes("billing")) {
                     errorMessage = "حدثت مشكلة متعلقة بالفواتير مع مفتاح API.";
                 } else {
                     errorMessage = `خطأ من الخادم (${response.status}): ${errorData.error.message}`;
                 }
            } else {
                errorMessage = `خطأ من الخادم (${response.status}): ${response.statusText}`;
            }
            addMessage(errorMessage, 'bot-message error-message'); // استخدام كلاس للخطأ
            return;
        }

        // استخلاص البيانات من الاستجابة الناجحة
        const data = await response.json();
        // console.log("--- API RESPONSE ---"); // لإظهار الرد الخام في الكونسول
        // console.log(JSON.stringify(data, null, 2));
        // console.log("--- END RESPONSE ---");

        let botResponseText = '';

        // التحقق من بنية الرد لـ Gemini
        if (data.candidates && data.candidates.length > 0) {
             const candidate = data.candidates[0];
             // التحقق من سبب الإنهاء (هل تم حظره بسبب الأمان؟)
             if (candidate.finishReason === 'SAFETY') {
                 console.warn("API Response blocked due to safety settings:", candidate.safetyRatings);
                 botResponseText = "عذراً، لم أتمكن من معالجة طلبك لأنه قد يخالف سياسات المحتوى.";
             } else if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                 botResponseText = candidate.content.parts[0].text;
             } else {
                  // حالة عدم وجود محتوى متوقعة
                 console.warn("API Response candidate has no content parts:", candidate);
                 botResponseText = responseTemplates.error || "لم أتمكن من الحصول على رد. حاول مرة أخرى.";
             }

        } else if (data.promptFeedback && data.promptFeedback.blockReason) {
            // إذا تم حظر الـ Prompt نفسه لأسباب تتعلق بالأمان
            console.warn("API Prompt blocked:", data.promptFeedback);
            botResponseText = "عذراً، لا يمكنني معالجة هذا النوع من الطلبات.";
        }
        else {
            // إذا كانت بنية الرد غير متوقعة تماماً
            console.warn('Unexpected API response structure:', data);
            botResponseText = responseTemplates.error || "حدث خطأ غير متوقع في الرد.";
        }

        // إضافة رد البوت للواجهة
        addMessage(botResponseText, 'bot-message');

    } catch (error) {
        // التعامل مع أخطاء الشبكة أو أخطاء JavaScript أخرى
        hideTypingIndicator(); // التأكد من إخفاء المؤشر
        console.error('Fetch/Processing Error:', error);
        addMessage(responseTemplates.error || 'عذراً، حدث خطأ غير متوقع. تحقق من اتصالك بالإنترنت.', 'bot-message error-message');
    }
}

// --- END OF FILE script.js ---