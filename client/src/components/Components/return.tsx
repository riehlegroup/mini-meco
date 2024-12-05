import React from "react";
import { useNavigate } from "react-router-dom";

const ReturnButton: React.FC = () => {
  const navigate = useNavigate();

  const returnToDashboard = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.stopPropagation();
    navigate("/dashboard");
  };

  return (
    <>
      <div className="Return" onClick={returnToDashboard}>
        Return
      </div>
      <style>{`
        .Return {
          width: 193px;
          height: 52px;
          flex-shrink: 0;
          border-radius: 5px;
          background: #e6e6e6;
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          font-size: 30px;
          position: absolute;
          top: 30px;
          left: 30px;
          cursor: pointer;
          z-index: 100;
        }
      `}</style>
    </>
  );
};

export default ReturnButton;
