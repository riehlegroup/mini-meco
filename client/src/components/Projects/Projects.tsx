import React from "react";
import Standups from "./Standups";
import Happiness from "./Happiness";
import CodeActivity from "./CodeActivity";
import "./Projects.css";

const Projects: React.FC = () => {
  return (
    <div>
      <div className="bigContainer">
        <div className="components">
          <Standups />
        </div>
        <div className="components">
          <Happiness />
        </div>
        <div className="components">
          <CodeActivity />
        </div>
      </div>
    </div>
  );
};

export default Projects;
