import { useState } from "react";
import {
  Menu, X, Home, Droplets, Trash2, Lightbulb, Construction,
  FileText, Search, ArrowRight, MapPin, ShieldCheck, Users,
  Megaphone, GraduationCap, Heart, Sprout, Building2, Wallet,
  ExternalLink, Info
} from "lucide-react";
import "./index.css";
import Admin from "./Admin";
import AdminLogin from "./AdminLogin";

const API_URL = "http://localhost:5000/api";

const services = [
  {
    title: "Road Problems",
    telugu: "రోడ్డు సమస్యలు",
    description: "Report damaged roads and potholes in your village.",
    icon: Construction,
    color: "#e9f2ff",
  },
  {
    title: "Water Supply",
    telugu: "నీటి సరఫరా",
    description: "Report water shortages and pipeline leaks.",
    icon: Droplets,
    color: "#e4f7ff",
  },
  {
    title: "Garbage Collection",
    telugu: "చెత్త సేకరణ",
    description: "Report overflowing bins and unclean areas.",
    icon: Trash2,
    color: "#fff2df",
  },
  {
    title: "Streetlights",
    telugu: "వీధి దీపాలు",
    description: "Report broken streetlights and dark streets.",
    icon: Lightbulb,
    color: "#fff8d9",
  },
];

const schemes = [
  {
    id: 1,
    title: "Pradhan Mantri Awaas Yojana – Gramin",
    shortTitle: "Rural Housing Assistance",
    category: "Housing",
    icon: Home,
    color: "#e9f2ff",
    description:
      "Government support for eligible rural households to build a pucca house.",
    eligibility:
      "Eligibility depends on current scheme guidelines and the official beneficiary selection process. Contact your Gram Panchayat to check the current rules.",
    documents: [
      "Identity and household details",
      "Bank account details, if required",
      "Documents requested during official verification",
    ],
    url: "https://pmayg.dord.gov.in/",
  },
  {
    id: 2,
    title: "Jal Jeevan Mission",
    shortTitle: "Rural Drinking Water",
    category: "Water & Sanitation",
    icon: Droplets,
    color: "#e4f7ff",
    description:
      "Learn about initiatives to provide safe tap water to rural households.",
    eligibility:
      "Contact your local Gram Panchayat or water-supply office about household connections and local implementation.",
    documents: [
      "Household or address details, if requested",
      "Application details required by the local water-supply office",
    ],
    url: "https://jaljeevanmission.gov.in/",
  },
  {
    id: 3,
    title: "Mahatma Gandhi National Rural Employment Guarantee Act",
    shortTitle: "MGNREGA Employment",
    category: "Employment",
    icon: Sprout,
    color: "#e8f7ed",
    description:
      "Find official information about rural employment and job-card services.",
    eligibility:
      "The programme covers eligible rural households whose adult members are willing to undertake unskilled manual work. Confirm the current process with your Gram Panchayat.",
    documents: [
      "Job card, if already issued",
      "Household and identity details",
      "Work-demand or registration information, as applicable",
    ],
    url: "https://nrega.nic.in/",
  },
  {
    id: 4,
    title: "National Scholarship Portal",
    shortTitle: "Student Scholarships",
    category: "Education",
    icon: GraduationCap,
    color: "#fff2df",
    description:
      "Find scholarship schemes and application information for eligible students.",
    eligibility:
      "Eligibility differs by scholarship, education level, income criteria and scheme-specific rules.",
    documents: [
      "Student and education details",
      "Income or category certificate, if required",
      "Bank details and other documents specified by the scheme",
    ],
    url: "https://scholarships.gov.in/",
  },
  {
    id: 5,
    title: "National Social Assistance Programme",
    shortTitle: "Social Assistance & Pensions",
    category: "Pensions & Welfare",
    icon: Heart,
    color: "#f7e9ff",
    description:
      "Read about social-assistance programmes for eligible older people, widows and persons with disabilities.",
    eligibility:
      "Eligibility and benefits vary by programme and current rules. Ask your local welfare office about central and Telangana state pension programmes.",
    documents: [
      "Age or relevant eligibility proof",
      "Identity and residence details",
      "Bank details and certificates required by the programme",
    ],
    url: "https://nsap.dord.gov.in/",
  },
  {
    id: 6,
    title: "Pradhan Mantri Kisan Samman Nidhi",
    shortTitle: "PM-KISAN Farmer Support",
    category: "Agriculture",
    icon: Sprout,
    color: "#e8f7ed",
    description:
      "Find official information about income support for eligible farmer families.",
    eligibility:
      "Eligibility depends on current PM-KISAN guidelines, land-record verification and applicable exclusions.",
    documents: [
      "Aadhaar and identity details, as required",
      "Landholding records",
      "Bank details and required verification",
    ],
    url: "https://pmkisan.gov.in/",
  },
  {
    id: 7,
    title: "Pradhan Mantri Jan-Dhan Yojana",
    shortTitle: "Financial Inclusion",
    category: "Pensions & Welfare",
    icon: Wallet,
    color: "#e9f2ff",
    description:
      "Learn about basic banking access and financial-inclusion services.",
    eligibility:
      "Account opening requirements and available services depend on bank rules and current programme guidelines.",
    documents: [
      "Identity and address documents accepted by the bank",
      "Any additional information required by the bank",
    ],
    url: "https://pmjdy.gov.in/",
  },
  {
    id: 8,
    title: "Pradhan Mantri Gram Sadak Yojana",
    shortTitle: "Rural Road Connectivity",
    category: "Housing & Infrastructure",
    icon: Building2,
    color: "#fff2df",
    description:
      "Explore official information about rural road connectivity and programme updates.",
    eligibility:
      "This is a rural road development programme, not a direct individual cash-benefit scheme. Contact the relevant local or district authority for project information.",
    documents: [
      "Village or road location details",
      "Any supporting information requested by the relevant office",
    ],
    url: "https://pmgsy.dord.gov.in/",
  },
];

const categories = [
  "All",
  "Agriculture",
  "Education",
  "Employment",
  "Housing",
  "Housing & Infrastructure",
  "Pensions & Welfare",
  "Water & Sanitation",
];

function App() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [telugu, setTelugu] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [showReportForm, setShowReportForm] = useState(false);

  const [schemeSearch, setSchemeSearch] = useState("");
  const [schemeCategory, setSchemeCategory] = useState("All");
  const [selectedScheme, setSelectedScheme] = useState(null);

  const [reportForm, setReportForm] = useState({
    title: "",
    description: "",
    category: "Road Problems",
    village: "",
    location: "",
  });

  const [reportLoading, setReportLoading] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingError, setTrackingError] = useState("");

  const openReportForm = (category = "Road Problems") => {
    setReportForm({
      title: "",
      description: "",
      category,
      village: "",
      location: "",
    });
    setReportMessage("");
    setReportSuccess(false);
    setShowReportForm(true);
  };

  const submitComplaint = async (event) => {
    event.preventDefault();
    setReportLoading(true);
    setReportMessage("");
    setReportSuccess(false);

    try {
      const response = await fetch(`${API_URL}/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: 1, ...reportForm }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not submit your complaint.");
      }

      setReportSuccess(true);
      setReportMessage(
        `Complaint submitted successfully! Your complaint ID is ${data.complaint_number}. Please save this ID to track your complaint.`
      );
      setTrackingId(data.complaint_number);

      setReportForm({
        title: "",
        description: "",
        category: "Road Problems",
        village: "",
        location: "",
      });
    } catch (error) {
      setReportMessage(
        error.message === "Failed to fetch"
          ? "Cannot connect to the backend. Make sure the backend is running at http://localhost:5000."
          : error.message
      );
    } finally {
      setReportLoading(false);
    }
  };

  const trackComplaint = async (event) => {
    event.preventDefault();
    const complaintId = trackingId.trim();

    if (!complaintId) {
      setTrackingError("Please enter your complaint ID.");
      setTrackingResult(null);
      return;
    }

    setTrackingLoading(true);
    setTrackingError("");
    setTrackingResult(null);

    try {
      const response = await fetch(
        `${API_URL}/complaints/${encodeURIComponent(complaintId)}`
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Complaint not found.");
      }

      setTrackingResult(data.complaint);
    } catch (error) {
      setTrackingError(
        error.message === "Failed to fetch"
          ? "Cannot connect to the backend. Make sure it is running."
          : error.message
      );
    } finally {
      setTrackingLoading(false);
    }
  };

  const filteredSchemes = schemes.filter((scheme) => {
    const query = schemeSearch.trim().toLowerCase();

    const matchesCategory =
      schemeCategory === "All" ||
      scheme.category === schemeCategory;

    const searchableText = [
      scheme.title,
      scheme.shortTitle,
      scheme.category,
      scheme.description,
    ].join(" ").toLowerCase();

    return matchesCategory &&
      (!query || searchableText.includes(query));
  });

  if (showLogin) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setShowLogin(false)}
          style={{ margin: "15px", padding: "10px 16px" }}
        >
          ← Back to Home
        </button>

        <AdminLogin
          onLogin={() => {
            setShowLogin(false);
            setShowAdmin(true);
          }}
        />
      </div>
    );
  }

  if (showAdmin) {
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            setShowAdmin(false);
            setShowLogin(false);
          }}
          style={{ margin: "15px", padding: "10px 16px" }}
        >
          ← Back to Home
        </button>
        <Admin
          onLogout={() => {
            setShowAdmin(false);
            setShowLogin(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#home">
          <div className="brand-icon"><Home size={25} /></div>
          <div>
            <strong>Grama Seva</strong>
            <span>Digital Gram Panchayat</span>
          </div>
        </a>

        <button
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#schemes" onClick={() => setMenuOpen(false)}>Government Schemes</a>
          <a href="#announcements" onClick={() => setMenuOpen(false)}>Announcements</a>
        </nav>

        <button type="button" onClick={() => setShowLogin(true)}>
          Admin Dashboard
        </button>

        <div className="nav-actions">
          <button
            className="language-button"
            onClick={() => setTelugu(!telugu)}
          >
            {telugu ? "English" : "తెలుగు"}
          </button>
          <button
            className="login-button"
            onClick={() => setShowLogin(true)}
          >
            Login
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="status-dot" />
              YOUR VILLAGE, CONNECTED
            </div>

            <h1>
              {telugu
                ? "మీ గ్రామం. మీ గొంతు. మా బాధ్యత."
                : "Your Village. Your Voice. Our Responsibility."}
            </h1>

            <p>
              {telugu
                ? "గ్రామ సమస్యలను తెలియజేయండి, ఫిర్యాదులను ట్రాక్ చేయండి మరియు ప్రభుత్వ సేవలను పొందండి."
                : "Report village problems, track your complaints, discover government schemes, and connect with your Gram Panchayat—all in one place."}
            </p>

            <div className="hero-actions">
              <a href="#services" className="primary-button">
                Explore Services <ArrowRight size={18} />
              </a>
              <a href="#track" className="secondary-button">
                <Search size={18} /> Track Complaint
              </a>
            </div>

            <div className="hero-note">
              <ShieldCheck size={19} />
              Transparent services for every villager
            </div>
          </div>

          <div className="hero-visual">
            <img
              src="https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=1000&q=85"
              alt="Village landscape with houses and greenery"
            />
            <div className="image-label">
              <div className="label-icon"><MapPin size={22} /></div>
              <div>
                <strong>Your village matters</strong>
                <span>Every issue deserves attention</span>
              </div>
            </div>
            <div className="floating-badge">
              <Users size={20} />
              <span>Community first</span>
            </div>
          </div>
        </section>

        <section className="stats">
          <div>
            <span className="stat-icon"><Users /></span>
            <div><strong>For Everyone</strong><p>Easy access to services</p></div>
          </div>
          <div>
            <span className="stat-icon"><FileText /></span>
            <div><strong>Trackable Complaints</strong><p>Follow your issue status</p></div>
          </div>
          <div>
            <span className="stat-icon"><ShieldCheck /></span>
            <div><strong>Transparent Process</strong><p>Better public service</p></div>
          </div>
        </section>

        <section className="section" id="services">
          <div className="section-heading">
            <span className="section-tag">OUR SERVICES</span>
            <h2>How can we help your village?</h2>
            <p>Choose a service to get started with your village issue.</p>
          </div>

          <div className="service-grid">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <article className="service-card" key={service.title}>
                  <div
                    className="service-icon"
                    style={{ backgroundColor: service.color }}
                  >
                    <Icon size={28} />
                  </div>
                  <h3>{telugu ? service.telugu : service.title}</h3>
                  <p>{service.description}</p>
                  <button
                    className="text-link"
                    onClick={() => openReportForm(service.title)}
                  >
                    Report an Issue <ArrowRight size={16} />
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="track-section" id="track">
          <div className="track-icon"><Search size={28} /></div>

          <div className="track-copy">
            <span className="section-tag">COMPLAINT TRACKING</span>
            <h2>Already reported an issue?</h2>
            <p>Enter your complaint ID to check its current status.</p>
          </div>

          <form className="track-form" onSubmit={trackComplaint}>
            <input
              value={trackingId}
              onChange={(event) => setTrackingId(event.target.value)}
              placeholder="Enter complaint ID"
              aria-label="Complaint ID"
              required
            />
            <button type="submit" disabled={trackingLoading}>
              {trackingLoading ? "Checking..." : "Track Status"}
            </button>
          </form>

          {trackingError && (
            <p role="alert" style={{ color: "#b42318", flexBasis: "100%" }}>
              {trackingError}
            </p>
          )}

          {trackingResult && (
            <div style={{
              flexBasis: "100%",
              marginTop: "18px",
              padding: "20px",
              borderRadius: "14px",
              background: "#ffffff",
              border: "1px solid #dbe7e3",
            }}>
              <h3 style={{ marginTop: 0 }}>Complaint Details</h3>
              <p><strong>Complaint ID:</strong> {trackingResult.complaint_number}</p>
              <p><strong>Title:</strong> {trackingResult.title}</p>
              <p><strong>Description:</strong> {trackingResult.description}</p>
              <p><strong>Category:</strong> {trackingResult.category}</p>
              <p><strong>Village:</strong> {trackingResult.village}</p>
              <p><strong>Status:</strong> {trackingResult.status}</p>
              <p><strong>Submitted:</strong> {new Date(trackingResult.created_at).toLocaleString()}</p>
              {trackingResult.admin_remarks && (
                <p><strong>Admin remarks:</strong> {trackingResult.admin_remarks}</p>
              )}
            </div>
          )}
        </section>

        {/* Government Schemes */}
        <section className="section schemes" id="schemes">
          <div className="section-heading">
            <span className="section-tag">PUBLIC INFORMATION</span>
            <h2>Government schemes for you</h2>
            <p>
              Search schemes by name or category and review official details
              before applying.
            </p>
          </div>

          <div className="scheme-tools">
            <label className="scheme-search">
              <Search size={19} />
              <input
                type="search"
                value={schemeSearch}
                onChange={(event) => setSchemeSearch(event.target.value)}
                placeholder="Search schemes, benefits or categories..."
                aria-label="Search government schemes"
              />
            </label>

            <label className="scheme-filter-label">
              <span>Category</span>
              <select
                value={schemeCategory}
                onChange={(event) => setSchemeCategory(event.target.value)}
                aria-label="Filter schemes by category"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="scheme-grid">
            {filteredSchemes.map((scheme) => {
              const Icon = scheme.icon;

              return (
                <article className="scheme-card" key={scheme.id}>
                  <div
                    className="scheme-icon"
                    style={{ backgroundColor: scheme.color }}
                  >
                    <Icon size={24} />
                  </div>

                  <span className="scheme-category">
                    {scheme.category.toUpperCase()}
                  </span>

                  <h3>{scheme.shortTitle}</h3>
                  <p>{scheme.description}</p>

                  <div className="scheme-card-actions">
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => setSelectedScheme(scheme)}
                    >
                      View details <ArrowRight size={16} />
                    </button>

                    <a
                      href={scheme.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Official site <ExternalLink size={15} />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredSchemes.length === 0 && (
            <div className="scheme-empty">
              <Search size={28} />
              <h3>No schemes found</h3>
              <p>Try another search word or choose a different category.</p>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setSchemeSearch("");
                  setSchemeCategory("All");
                }}
              >
                Clear filters
              </button>
            </div>
          )}

          <div className="scheme-notice">
            <Info size={20} />
            <p>
              <strong>Important:</strong> Scheme eligibility, benefits and
              required documents can change. This page is a starting point,
              not an eligibility decision. Confirm current information on the
              linked official government website or with your Gram Panchayat.
            </p>
          </div>
        </section>

        <section className="announcement-section" id="announcements">
          <div>
            <span className="section-tag">STAY INFORMED</span>
            <h2>Village announcements</h2>
            <p>Important updates from your Gram Panchayat.</p>
          </div>

          <article className="announcement-card">
            <span className="announcement-icon"><Megaphone size={22} /></span>
            <div>
              <span className="announcement-label">SAMPLE ANNOUNCEMENT</span>
              <h3>Welcome to Grama Seva</h3>
              <p>
                This space will display official village announcements when
                the administrator publishes them.
              </p>
            </div>
          </article>
        </section>

        <section className="contact-strip">
          <div>
            <h2>Better villages begin with your voice.</h2>
            <p>Report issues and help your community move forward.</p>
          </div>
          <a href="#services" className="primary-button">
            Get Started <ArrowRight size={18} />
          </a>
        </section>

        {/* Scheme details popup */}
        {selectedScheme && (
          <div
            className="scheme-modal-backdrop"
            role="presentation"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedScheme(null);
              }
            }}
          >
            <section
              className="scheme-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="scheme-modal-title"
            >
              <button
                className="scheme-modal-close"
                type="button"
                onClick={() => setSelectedScheme(null)}
                aria-label="Close scheme details"
              >
                <X size={22} />
              </button>

              <span className="section-tag">
                {selectedScheme.category.toUpperCase()}
              </span>
              <h2 id="scheme-modal-title">{selectedScheme.title}</h2>
              <p>{selectedScheme.description}</p>

              <h3>Who may be eligible?</h3>
              <p>{selectedScheme.eligibility}</p>

              <h3>Documents or information to prepare</h3>
              <ul>
                {selectedScheme.documents.map((document) => (
                  <li key={document}>{document}</li>
                ))}
              </ul>

              <p className="scheme-modal-note">
                <Info size={18} />
                This is general guidance. Official scheme rules and local
                verification take priority.
              </p>

              <a
                className="primary-button"
                href={selectedScheme.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit official website <ExternalLink size={17} />
              </a>
            </section>
          </div>
        )}

        {/* Complaint form */}
        {showReportForm && (
          <div
            role="presentation"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setShowReportForm(false);
              }
            }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              background: "rgba(15, 23, 42, 0.62)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              overflowY: "auto",
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="report-title"
              style={{
                width: "100%",
                maxWidth: "620px",
                maxHeight: "90vh",
                overflowY: "auto",
                background: "#ffffff",
                borderRadius: "18px",
                padding: "28px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "16px",
                alignItems: "center",
              }}>
                <div>
                  <span className="section-tag">CITIZEN SERVICE</span>
                  <h2 id="report-title" style={{ margin: "8px 0" }}>
                    Report a Village Issue
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  aria-label="Close report form"
                  style={{
                    border: 0,
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              {reportMessage && (
                <p
                  role="status"
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    background: reportSuccess ? "#e8f7ed" : "#fff0ee",
                    color: reportSuccess ? "#17663a" : "#b42318",
                    lineHeight: 1.5,
                    overflowWrap: "anywhere",
                  }}
                >
                  {reportMessage}
                </p>
              )}

              <form
                onSubmit={submitComplaint}
                style={{ display: "grid", gap: "14px", marginTop: "18px" }}
              >
                <label style={{ display: "grid", gap: "6px" }}>
                  Complaint title *
                  <input
                    required
                    maxLength={150}
                    value={reportForm.title}
                    onChange={(event) =>
                      setReportForm({ ...reportForm, title: event.target.value })
                    }
                    placeholder="Example: Water supply problem"
                  />
                </label>

                <label style={{ display: "grid", gap: "6px" }}>
                  Description *
                  <textarea
                    required
                    rows={4}
                    value={reportForm.description}
                    onChange={(event) =>
                      setReportForm({
                        ...reportForm,
                        description: event.target.value,
                      })
                    }
                    placeholder="Explain the issue clearly..."
                  />
                </label>

                <label style={{ display: "grid", gap: "6px" }}>
                  Category *
                  <select
                    required
                    value={reportForm.category}
                    onChange={(event) =>
                      setReportForm({
                        ...reportForm,
                        category: event.target.value,
                      })
                    }
                  >
                    <option>Road Problems</option>
                    <option>Water Supply</option>
                    <option>Garbage Collection</option>
                    <option>Streetlights</option>
                    <option>Drainage</option>
                    <option>Other</option>
                  </select>
                </label>

                <label style={{ display: "grid", gap: "6px" }}>
                  Village name *
                  <input
                    required
                    value={reportForm.village}
                    onChange={(event) =>
                      setReportForm({
                        ...reportForm,
                        village: event.target.value,
                      })
                    }
                    placeholder="Enter your village name"
                  />
                </label>

                <label style={{ display: "grid", gap: "6px" }}>
                  Location (optional)
                  <input
                    value={reportForm.location}
                    onChange={(event) =>
                      setReportForm({
                        ...reportForm,
                        location: event.target.value,
                      })
                    }
                    placeholder="Street, landmark, or area"
                  />
                </label>

                <div style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "4px",
                }}>
                  <button
                    className="primary-button"
                    type="submit"
                    disabled={reportLoading}
                  >
                    {reportLoading ? "Submitting..." : "Submit Complaint"}
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setShowReportForm(false)}
                  >
                    Close
                  </button>
                </div>

                <small style={{ color: "#667085", lineHeight: 1.5 }}>
                  Prototype note: this form uses a temporary test citizen
                  account (user ID 1). Citizen registration and login will be
                  connected later.
                </small>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#home">
          <div className="brand-icon"><Home size={23} /></div>
          <div>
            <strong>Grama Seva</strong>
            <span>Digital Gram Panchayat</span>
          </div>
        </a>
        <p>Connecting villages with better public services.</p>
        <span>© 2026 Grama Seva · Student Project Prototype</span>
      </footer>
    </div>
  );
}

export default App;