export async function callLLM1(userMessage) {
    try {
    const response = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ "message": userMessage }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data.reply; 
  } catch (error) {
    console.error("LLM API Error:", error);
    return "⚠️ Sorry, something went wrong while contacting the AI.";
  }
}

export async function callLLM2(userMessage) {
  //MISTRAL LLM

  
  // try {
  //     const response = await fetch("http://127.0.0.1:8000/explain", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ "message": userMessage }),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Error: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     return data.reply; 
  //   } catch (error) {
  //     console.error("LLM API Error:", error);
  //     return "⚠️ Sorry, something went wrong while contacting the AI.";
  //   }
}
