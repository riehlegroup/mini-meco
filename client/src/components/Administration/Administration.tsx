import UserAdmin from "./UserAdmin";
import ProjectAdmin from "./ProjectAdmin";
import "./Administration.css";

const Administration = () => {
  return (
    <div>
      <div className="AdminbigContainer">
        <div className="AdminComponents">
          <UserAdmin />
        </div>
        <div className="AdminComponents">
          <ProjectAdmin />
        </div>
      </div>
    </div>
  );
};

export default Administration;
