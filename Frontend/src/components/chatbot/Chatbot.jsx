import { useState } from "react";
import axios from "axios";
import { Input } from '../index'
import { Button } from "../index";

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const handleAsk = async () => {
    const res = await axios.post("http://localhost:3000/api/ai/ask", {
      question: input,
    });
    setResponse(res.data.response);
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask something about OS..."
      />
      <Button className="mt-2" onClick={handleAsk}>Ask</Button>
      <div className="mt-4 p-4 bg-gray-100 rounded">{response}</div>
    </div>
  );
};

export default Chatbot;
