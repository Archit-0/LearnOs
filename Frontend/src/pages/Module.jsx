import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import apiService from "../Api/api";

export default function ModulesList() {
  const [modules, setModules] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchModules() {
      try {
        const res = await apiService.getModules()
        console.log("modules: ", res.modules);
        setModules(res.modules);
      } catch (err) {
        console.error("Error fetching modules:", err);
      }
    }
    fetchModules();
  }, []);

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {modules.map((module) => (
        <div
          key={module._id}
          className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-lg transition"
          onClick={() => navigate(`/quizzes/start/${module._id}`)}
        >
          <h2 className="text-xl font-bold">{module.title}</h2>
          <p className="text-gray-600 mt-2">{module.description}</p>
          <span className="inline-block mt-4 px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-full">
            {module.difficulty}
          </span>
        </div>
      ))}
    </div>
  );
}
