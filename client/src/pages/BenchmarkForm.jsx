import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navigation/Navbar.jsx";
import Page from "../components/ui/Page";




export default function BenchmarkForm() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("");
  const [formData, setFormData] = useState({
    schoolName: "",
    admissionsTotal: "",
    studentCount: "",
    // Add more fields as needed


  });

  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem("token"), []);

  useEffect(() => {
    if (!token) {
      setStatus("No auth token found. You can still fill the form.");
      return;
    }

    // Minimal user placeholder so page logic has a stable shape.
    setUser({ tokenPresent: true });
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = (event) => {
    event.preventDefault();
    localStorage.setItem("benchmarkFormSubmitted", JSON.stringify(formData));
    setStatus("Form submitted.");

    // Basic flow: return to dashboard if route exists.
    navigate("/dashboard");
  };

//   Complete Annual Benchmarking Form(s)
// o User opens the current year’s benchmarking form
// o User fills in multiple sections (admissions, demographics, facilities, academics, athletics,
// etc.)
// o System validates entries (numeric ranges, required fields, logical consistency)
// o System highlights errors and offers help
// o User saves and submits the form

//
//   The system shall display an annual benchmarking form divided into logical sections and
//   steps
//   o The system shall provide inline help or tooltips for fields that are often confusing
//   o The system shall perform:
//       ▪ Required field checks
// ▪ Type checks (for example, numeric only where appropriate)
// ▪ Range checks where sensible (for example, percentages between 0 and 100)
//   o The system shall not allow final submission until all blocking validation errors are
//   resolved


//   Dashboards and Charts
//   o The system shall present dashboards organized by category (facilities, academics,
//       athletics, etc.)
//   o Each dashboard shall:
//       ▪ Display a selection of KPIs as tiles/cards with summary values
// ▪ Provide at least two different chart types (for example, bar chart and line chart)
//   using Chart.js
//   o The system shall allow users to:
//       ▪ Filter by year
// ▪ Select different peer groups (as defined in the dummy data)
// ▪ View their school’s values against peer group averages, medians, or ranges


  return (
      <>
      <Navbar/>
        <Page className="w-full">
          <div style={{ maxWidth: "720px", width: "100%", margin: "0 auto", padding: "1rem" }}>
            <h1>Annual Benchmarking Form</h1>
            <p>Year: {new Date().getFullYear()}</p>
            {user && <p>Signed in: Yes</p>}
            {status && <p>{status}</p>}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "0.75rem" }}>
                <label htmlFor="schoolName">School Name</label>
                <input
                    id="schoolName"
                    name="schoolName"
                    type="text"
                    value={formData.schoolName}
                    onChange={handleChange}
                    required
                    style={{ display: "block", width: "100%" }}
                />
              </div>

              <div style={{ marginBottom: "0.75rem" }}>
                <label htmlFor="admissionsTotal">Admissions (Total)</label>
                <input
                    id="admissionsTotal"
                    name="admissionsTotal"
                    type="number"
                    min="0"
                    value={formData.admissionsTotal}
                    onChange={handleChange}
                    required
                    style={{ display: "block", width: "100%" }}
                />
              </div>

              <div style={{ marginBottom: "0.75rem" }}>
                <label htmlFor="demographics">Demographics (Total)</label>
                <input
                    id="demographics"
                    name="demographics"
                    type="number"
                    min="0"
                    value={formData.demographics}
                    onChange={handleChange}
                    required
                    style={{ display: "block", width: "100%" }}
                />
              </div>

              <div style={{ marginBottom: "0.75rem" }}>
                <label htmlFor="facilities">facilities</label>
                <input
                    id="facilities"
                    name="facilities"
                    type="number"
                    min="0"
                    value={formData.facilities}
                    onChange={handleChange}
                    required
                    style={{ display: "block", width: "100%" }}
                />
              </div>

              <div style={{ marginBottom: "0.75rem" }}>
                <label htmlFor="academics">academics</label>
                <input
                    id="academics"
                    name="academics"
                    type="number"
                    min="0"
                    value={formData.academics}
                    onChange={handleChange}
                    required
                    style={{ display: "block", width: "100%" }}
                />
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label htmlFor="athletics">atheltics</label>
                <input
                    id="atheltics"
                    name="athletics"
                    type="number"
                    min="0"
                    value={formData.athletics}
                    onChange={handleChange}
                    required
                    style={{ display: "block", width: "100%" }}
                />
              </div>



              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="submit">Submit</button>
                <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem("token");
                      navigate("/");
                    }}
                >
                  Log Out
                </button>
              </div>
            </form>
          </div>
        </Page>
      </>

  );
}