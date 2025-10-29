import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { UserProfile, SymptomLog, MealPlan, FoodCheckResult, FoodSafety, Recipe } from '../types';

export async function generateMealPlan(apiKey: string, profile: UserProfile, symptoms: SymptomLog[]): Promise<MealPlan> {
    const ai = new GoogleGenAI({ apiKey });
    const symptomHistory = symptoms.map(s => `- Vào ${s.timestamp.toLocaleString()}, đã ăn '${s.eatenFoods}' và bị đau mức ${s.painLevel}/10 tại ${s.painLocation}.`).join('\n');

    const prompt = `
      Dựa vào thông tin sức khỏe của người dùng sau đây, hãy tạo một kế hoạch thực đơn chi tiết cho 7 ngày tới.
      
      HỒ SƠ NGƯỜI DÙNG:
      - Tình trạng bệnh lý: ${profile.condition}
      - Mức độ đau hiện tại: ${profile.painLevel}/10
      - Các thực phẩm đã biết gây kích ứng: ${profile.triggerFoods}
      - Mục tiêu ăn kiêng: ${profile.dietaryGoal}

      LỊCH SỬ TRIỆU CHỨNG GẦN ĐÂY:
      ${symptomHistory || "Chưa có lịch sử triệu chứng."}

      YÊU CẦU:
      - Tạo thực đơn cho 7 ngày, mỗi ngày 3 bữa chính (sáng, trưa, tối) và 2 bữa phụ.
      - Các món ăn phải dễ tiêu hóa, phù hợp với tình trạng bệnh lý và mục tiêu của người dùng.
      - Tránh hoàn toàn các thực phẩm đã biết gây kích ứng.
      - Ghi rõ tên món ăn, thời gian ăn gợi ý, và khẩu phần ăn hợp lý.
      - Đảm bảo thực đơn đa dạng và đủ dinh dưỡng.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            day: { type: Type.STRING, description: 'Ngày trong tuần (ví dụ: Ngày 1, Thứ Hai)' },
                            meals: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING, description: 'Tên món ăn' },
                                        time: { type: Type.STRING, description: 'Thời gian ăn gợi ý (ví dụ: 7:00 AM)' },
                                        portion: { type: Type.STRING, description: 'Khẩu phần gợi ý (ví dụ: 1 bát nhỏ)' }
                                    },
                                    required: ['name', 'time', 'portion']
                                }
                            }
                        },
                        required: ['day', 'meals']
                    }
                }
            }
        });
        const resultText = response.text.trim();
        return JSON.parse(resultText) as MealPlan;
    } catch (error) {
        console.error("Error generating meal plan:", error);
        throw new Error("Không thể tạo thực đơn. Vui lòng thử lại.");
    }
}

export async function checkFoodSafety(apiKey: string, profile: UserProfile, foodName: string, foodImage?: {mimeType: string, data: string}): Promise<FoodCheckResult> {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      Phân tích thực phẩm này cho người dùng có thông tin sức khỏe sau:
      - Tình trạng bệnh lý: ${profile.condition}
      - Các thực phẩm đã biết gây kích ứng: ${profile.triggerFoods}

      Thực phẩm cần kiểm tra: "${foodName}"

      YÊU CẦU:
      1. Đánh giá mức độ an toàn của thực phẩm này theo 3 cấp độ: "An toàn", "Hạn chế", "Tránh".
      2. Giải thích ngắn gọn lý do cho đánh giá của bạn.
      3. Cung cấp một "Dẫn chứng khoa học" ngắn gọn cho nhận định trên, nếu có thể, hãy trích dẫn nguồn (ví dụ: tên nghiên cứu, bài báo y khoa). Nếu không có dẫn chứng cụ thể, hãy giải thích dựa trên nguyên tắc dinh dưỡng chung.
    `;
    
    const textPart = { text: prompt };
    const parts = foodImage
      ? [{ inlineData: foodImage }, textPart]
      : [textPart];

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
             config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        safetyLevel: { type: Type.STRING, enum: [FoodSafety.Safe, FoodSafety.Limit, FoodSafety.Avoid] },
                        reason: { type: Type.STRING, description: 'Lý do giải thích cho đánh giá' },
                        scientificEvidence: { type: Type.STRING, description: 'Dẫn chứng khoa học và nguồn trích dẫn nếu có' }
                    },
                    required: ['safetyLevel', 'reason']
                }
            }
        });
        const resultText = response.text.trim();
        return JSON.parse(resultText) as FoodCheckResult;
    } catch (error) {
        console.error("Error checking food safety:", error);
        throw new Error("Không thể kiểm tra thực phẩm. Vui lòng thử lại.");
    }
}

export async function analyzeTriggers(apiKey: string, profile: UserProfile, symptoms: SymptomLog[]): Promise<string> {
    const ai = new GoogleGenAI({ apiKey });
    if(symptoms.length < 3) return "Chưa đủ dữ liệu để phân tích. Hãy ghi lại thêm các triệu chứng của bạn, bao gồm cả những ngày bạn cảm thấy khỏe (mức đau = 0).";

    const logData = symptoms.map(s => {
        const activity = s.physicalActivity ? `Vận động: "${s.physicalActivity}"` : 'Không vận động';
        const painDescription = s.painLevel > 0 ? `Đau mức ${s.painLevel}/10 tại ${s.painLocation}` : 'Không đau';
        return `- Ngày ${s.timestamp.toLocaleDateString()}: Ăn "${s.eatenFoods}". ${activity}. Kết quả: ${painDescription}.`;
    }).join('\n');

    const prompt = `
        Dựa trên hồ sơ người dùng và nhật ký sức khỏe sau đây, hãy thực hiện một phân tích so sánh chi tiết để xác định các yếu tố ảnh hưởng đến tình trạng của họ.

        HỒ SƠ NGƯỜI DÙNG:
        - Tình trạng bệnh lý: ${profile.condition}
        - Các thực phẩm đã biết gây kích ứng: ${profile.triggerFoods}

        NHẬT KÝ SỨC KHỎE:
        ${logData}

        YÊU CẦU PHÂN TÍCH:
        1.  **Phân tích Tác nhân Gây đau (Thủ phạm):**
            *   Xác định các loại thực phẩm, đồ uống, hoặc hoạt động thể chất thường xuất hiện TRƯỚC khi người dùng ghi nhận có cơn đau (mức đau > 0).
            *   Đưa ra giả thuyết về các "thủ phạm" tiềm tàng. Ví dụ: "Ăn đồ cay và không vận động sau đó có vẻ liên quan đến các cơn đau ở vùng thượng vị."

        2.  **Phân tích Yếu tố Tích cực (Những gì hiệu quả):**
            *   Xác định các loại thực phẩm, đồ uống, hoặc hoạt động thể chất thường xuất hiện khi người dùng ghi nhận KHÔNG đau (mức đau = 0).
            *   Tìm ra các "yếu tố bảo vệ" hoặc thói quen tốt. Ví dụ: "Những ngày bạn ăn cháo yến mạch cho bữa sáng và đi bộ nhẹ nhàng, bạn thường không bị đau."

        3.  **So sánh và Đề xuất:**
            *   So sánh hai nhóm phân tích trên để rút ra kết luận.
            *   Đưa ra các đề xuất cụ thể, có tính hành động. Phân thành 3 mục:
                *   **NÊN TRÁNH:** Liệt kê những thứ cần hạn chế hoặc tránh.
                *   **NÊN DUY TRÌ:** Liệt kê những thói quen tốt cần tiếp tục.
                *   **NÊN THỬ BỔ SUNG:** Gợi ý những thay đổi hoặc bổ sung mới dựa trên phân tích. Ví dụ: "Hãy thử thay thế cà phê buổi sáng bằng trà gừng, và thêm 15 phút đi bộ sau bữa trưa."

        Trình bày kết quả dưới dạng một báo cáo rõ ràng, dễ hiểu, sử dụng markdown với các tiêu đề in đậm.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing triggers:", error);
        throw new Error("Không thể phân tích. Vui lòng thử lại.");
    }
}

export async function suggestRecipe(apiKey: string, profile: UserProfile, request: string): Promise<Recipe> {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Với vai trò là một chuyên gia dinh dưỡng cho người bị bệnh về dạ dày, hãy tạo một công thức nấu ăn mới dựa trên yêu cầu của người dùng và hồ sơ sức khỏe của họ.

      HỒ SƠ NGƯỜI DÙNG:
      - Tình trạng bệnh lý: ${profile.condition}
      - Các thực phẩm đã biết gây kích ứng: ${profile.triggerFoods}
      - Mục tiêu ăn kiêng: ${profile.dietaryGoal}

      YÊU CẦU CỦA NGƯỜI DÙNG:
      "${request}"

      YÊU CẦU VỀ CÔNG THỨC:
      - Công thức phải tuyệt đối an toàn, dễ tiêu hóa, phù hợp với hồ sơ người dùng.
      - Tránh tất cả các thực phẩm gây kích ứng đã biết.
      - Cung cấp tên món ăn (title), mô tả ngắn (description), thời gian nấu (cookTime), danh sách nguyên liệu (ingredients) và hướng dẫn chi tiết (instructions).
    `;
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        cookTime: { type: Type.STRING },
                        ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                        instructions: { type: Type.STRING }
                    },
                    required: ['title', 'description', 'cookTime', 'ingredients', 'instructions']
                }
            }
        });
        const resultText = response.text.trim();
        const parsedResult = JSON.parse(resultText);
        // Add a custom category for AI generated recipes
        return { ...parsedResult, category: 'AI Tùy chỉnh' } as Recipe;
    } catch (error) {
        console.error("Error suggesting recipe:", error);
        throw new Error("Không thể tạo công thức. Vui lòng thử lại với yêu cầu khác.");
    }
}