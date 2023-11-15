const responses = {
  "questions": [
    {
      "question": "hello",
      "response": [
        "Hello! How can I assist you with hiring a virtual assistant today?"
      ]
    },
    {
      "question": "hi",
      "response": [
        "Hello! How can I assist you with hiring a virtual assistant today?"
      ]
    },
    {
      "question": "hello there",
      "response": [
        "Hello! How can I assist you with hiring a virtual assistant today?"
      ]
    },
    {
      "question": "hey",
      "response": [
        "Hello! How can I assist you with hiring a virtual assistant today?"
      ]
    },
    {
      "question": "yeah",
      "response": ["email: help@assistafrica.com or call us at +254790000000"]
    },
    {
      "question": "yes",
      "response": ["email: help@assistafrica.com or call us at +254790000000"]
    },
    {
      "question": "how can I find a virtual assistant?",
      "response": [
        "To find a virtual assistant, you can browse our list of qualified virtual assistants in various categories and skills. You can also use our search feature to narrow down your options.",
        "You can start by searching for virtual assistants based on your specific needs and criteria. Our platform offers a wide range of talented virtual assistants for different tasks."
      ]
    },
    {
      "question": "what skills should I look for in a virtual assistant?",
      "response": [
        "The skills you should look for depend on your specific requirements. Common virtual assistant skills include administrative tasks, customer support, data entry, content writing, and more. Consider the tasks you need assistance with and search for virtual assistants with those skills.",
        "Think about the tasks you need help with and search for virtual assistants who specialize in those areas. Our platform offers a variety of skilled virtual assistants to match your needs."
      ]
    },
    {
      "question": "how do I hire a virtual assistant?",
      "response": [
        "To hire a virtual assistant, you can browse profiles, review qualifications and experience, and send direct messages to candidates you're interested in. Once you find the right fit, you can negotiate terms and agree on the scope of work.",
        "Hiring a virtual assistant is easy! Simply explore our virtual assistant profiles, communicate with candidates, and finalize your hiring decision. You can also use our platform to manage payments and tasks efficiently."
      ]
    },
    {
      "question": "can you recommend a virtual assistant for marketing tasks?",
      "response": [
        "Of course! We have several qualified virtual assistants who specialize in marketing tasks. To find the perfect match, please provide more details about your specific marketing needs, and I'll suggest some candidates for you.",
        "Certainly! We can help you find a virtual assistant with expertise in marketing. Please share more information about your marketing project, and I'll recommend suitable candidates for you to consider."
      ]
    },
    {
      "question": "how do payments work on your platform?",
      "response": [
        "Payments on our platform are secure and easy. Once you've agreed on terms with a virtual assistant, you can make payments through our platform using various payment methods. We ensure that payments are processed safely and efficiently.",
        "We offer a secure payment system for all transactions. You can make payments to your virtual assistant using our platform, and we'll handle the payment processing to ensure a smooth and reliable experience."
      ]
    },
    {
      "question": "what is the hiring process like?",
      "response": [
        "The hiring process involves searching for virtual assistants, reviewing profiles, contacting candidates, discussing your needs, negotiating terms, and finalizing the agreement. Our platform provides tools to facilitate this process.",
        "Our hiring process is straightforward. Start by searching for virtual assistants, interact with candidates to discuss your project, negotiate terms, and formalize the hiring agreement. Our platform streamlines the entire process for your convenience."
      ]
    },
    {
      "question": "do you offer any guarantees for virtual assistant services?",
      "response": [
        "While we don't directly guarantee virtual assistant services, we provide a platform where you can review candidate profiles, communicate, and select the best fit for your needs. We also offer a dispute resolution process in case of issues.",
        "We don't offer guarantees for virtual assistant services, but we do provide a secure platform for hiring. You can review candidate profiles, communicate with candidates, and select the virtual assistant that meets your requirements. In case of disputes, we have a resolution process in place."
      ]
    }
  ]
}


const findResponse = (question) => {
  const foundQuestion = responses.questions.find(
    (qna) => qna.question.toLowerCase() === question.toLowerCase()
  );

  if (foundQuestion) {
    const randomResponse =
      foundQuestion.response[
        Math.floor(Math.random() * foundQuestion.response.length)
      ];
    return randomResponse;
  } else {
    return "I'm sorry, I don't have a response to that question. Would you like to talk to one of our agent";
  }
};

export const handleUserMessage = (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  const response = findResponse(message);

  if (response) {
    return res.json({ response });
  } else {
    const defaultResponse =
      "I'm sorry, I don't understand that question. Would you like to talk to one of our agents";
    return res.json({ response: defaultResponse });
  }
};
