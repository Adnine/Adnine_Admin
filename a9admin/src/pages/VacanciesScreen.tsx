import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchUserVacancies } from "../utils/fetchVacancies";
import {
  MdArrowBack,
  MdSearch,
  MdBusiness,
  MdLocationOn,
  MdAttachMoney,
  MdWork,
  MdPeople,
  MdAccountCircle,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";

// Helper function to format date strings (not directly used here but good to keep if needed elsewhere)
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

const DESCRIPTION_LIMIT = 150; // Max characters before truncating

const VacanciesScreen = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{
    [key: string]: boolean;
  }>({}); // State to manage expanded descriptions
  const location = useLocation();

  const { profilePicture, username, businessName } = location.state || {};

  useEffect(() => {
    const loadVacancies = async () => {
      try {
        const data = await fetchUserVacancies(userId);
        console.log("✅ Vacancies Data:", data);
        setVacancies(data);
      } catch (err) {
        console.error("Error fetching user vacancies:", err);
      } finally {
        setLoading(false);
      }
    };
    loadVacancies();
  }, [userId]);

  const filteredVacancies = vacancies.filter((v) =>
    v.vacancy_title?.toLowerCase().includes(search.toLowerCase())
  );

  // Function to toggle the expanded state for a specific vacancy
  const toggleDescription = (id: string) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        {/* User Profile Header */}
        <div style={styles.userInfoSection}>
          <div style={styles.userProfile}>
            {profilePicture ? (
              <img
                src={profilePicture}
                alt={username || businessName}
                style={styles.profileImage}
              />
            ) : (
              <div style={styles.profilePlaceholder}>
                <MdAccountCircle size={32} />
              </div>
            )}
            <div style={styles.userDetails}>
              <h2 style={styles.userName}>
                {businessName || username || "User"}
              </h2>
              <p style={styles.userId}>
                <MdWork size={14} style={styles.iconInline} />
                User ID: {userId}
              </p>
              {username && businessName && username !== businessName && (
                <p style={styles.username}>@{username}</p>
              )}
            </div>
          </div>
        </div>

        <h2 style={styles.pageTitle}>
          <MdWork style={styles.titleIcon} />
          User Vacancies
        </h2>
        <p style={styles.pageText}>
          View all job vacancies created by this user. You can search, explore
          details, and check how many users applied for each job.
        </p>

        <button style={styles.backButton} onClick={() => navigate(-1)}>
          <MdArrowBack size={18} style={styles.buttonIcon} />
          Go Back
        </button>

        {/* 🔍 Search */}
        <div style={styles.searchContainer}>
          <div style={styles.searchInputWrapper}>
            <MdSearch size={20} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search vacancies by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* 🧠 Vacancies Content */}
        {loading ? (
          <p style={styles.loadingText}>Loading vacancies...</p>
        ) : filteredVacancies.length === 0 ? (
          <p style={styles.noResults}>No vacancies found.</p>
        ) : (
          <div style={styles.cardsContainer}>
            {filteredVacancies.map((v) => {
              const isExpanded = expandedDescriptions[v.id];
              const showReadMore =
                v.vacancy_description &&
                v.vacancy_description.length > DESCRIPTION_LIMIT;
              const displayedDescription =
                showReadMore && !isExpanded
                  ? v.vacancy_description.substring(0, DESCRIPTION_LIMIT) +
                    "..."
                  : v.vacancy_description;

              return (
                <div key={v.id} style={styles.card}>
                  {/* --- Card Header --- */}
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>
                      <MdWork size={18} style={styles.cardTitleIcon} />
                      {v.vacancy_title || "Untitled Vacancy"}
                    </h3>
                    <span
                      style={
                        v.is_hidden
                          ? styles.statusBadgeHidden
                          : styles.statusBadgeActive
                      }
                    >
                      {v.is_hidden ? (
                        <>
                          <MdVisibilityOff size={12} style={styles.badgeIcon} />
                          Hidden
                        </>
                      ) : (
                        <>
                          <MdVisibility size={12} style={styles.badgeIcon} />
                          Active
                        </>
                      )}
                    </span>
                  </div>

                  {/* --- Card Body --- */}
                  <div style={styles.cardBody}>
                    <p style={styles.cardField}>
                      <span style={styles.label}>
                        <MdBusiness size={14} style={styles.fieldIcon} />
                        Industry:
                      </span>{" "}
                      {v.industry || "N/A"}
                    </p>
                    <p style={styles.cardField}>
                      <span style={styles.label}>
                        <MdLocationOn size={14} style={styles.fieldIcon} />
                        Location:
                      </span>{" "}
                      {v.location || "N/A"}
                    </p>
                    <p style={styles.cardField}>
                      <span style={styles.label}>
                        <MdAttachMoney size={14} style={styles.fieldIcon} />
                        Salary:
                      </span>{" "}
                      {v.vacancy_salary
                        ? `${v.vacancy_salary} ${v.salary_currency || ""}`
                        : "N/A"}
                    </p>
                  </div>

                  {/* --- Description --- */}
                  {v.vacancy_description && (
                    <div style={styles.descriptionContainer}>
                      <p style={styles.description}>{displayedDescription}</p>
                      {showReadMore && (
                        <button
                          onClick={() => toggleDescription(v.id)}
                          style={styles.readMoreButton}
                        >
                          {isExpanded ? "Show Less" : "Read More"}
                        </button>
                      )}
                    </div>
                  )}

                  {/* --- Card Footer --- */}
                  <div style={styles.cardFooter}>
                    <span style={styles.applicantBadge}>
                      <MdPeople size={16} style={styles.applicantIcon} />
                      {v.applied_users?.length || 0} Applicants
                    </span>
                    <button
                      style={styles.detailsButton}
                      onClick={() => navigate(`/vacancy/${v.id}/applicants`)}
                    >
                      <MdPeople size={14} style={styles.buttonIcon} />
                      View Applicants
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// 💅 Styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    padding: "32px",
    background: "linear-gradient(to bottom, #160F24, #24213C, #2E1F3A)",
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
    color: "#f0f0f0",
  },
  mainContent: {
    width: "100%",
    maxWidth: "90vw",
    margin: "0 auto",
  },
  // New User Profile Styles
  userInfoSection: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(0, 189, 214, 0.3)",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
  },
  userProfile: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  profileImage: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #00BDD6",
  },
  profilePlaceholder: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    backgroundColor: "rgba(0, 189, 214, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    color: "#00BDD6",
    border: "3px solid #00BDD6",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: "#00BDD6",
    fontSize: "24px",
    fontWeight: "bold",
    margin: "0 0 4px 0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  userId: {
    color: "#aaa",
    fontSize: "14px",
    margin: "0 0 2px 0",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  username: {
    color: "#00FF9D",
    fontSize: "14px",
    margin: 0,
    fontWeight: "500",
  },
  iconInline: {
    marginRight: "4px",
  },
  pageTitle: {
    color: "#00BDD6",
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  titleIcon: {
    marginRight: "8px",
  },
  pageText: {
    fontSize: "16px",
    lineHeight: 1.6,
    marginBottom: "24px",
  },
  backButton: {
    backgroundColor: "#8050E6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "background-color 0.2s ease",
  },
  buttonIcon: {
    marginRight: "4px",
  },
  searchContainer: {
    marginBottom: "24px",
  },
  searchInputWrapper: {
    position: "relative",
    display: "inline-block",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#00BDD6",
  },
  searchInput: {
    width: "100%",
    maxWidth: "400px",
    padding: "10px 12px 10px 40px",
    borderRadius: "6px",
    border: "1px solid #00BDD6",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "white",
    fontSize: "14px",
  },
  loadingText: {
    marginTop: "30px",
    fontSize: "16px",
    color: "#aaa",
  },
  noResults: {
    marginTop: "30px",
    fontSize: "16px",
    color: "#ccc",
  },
  cardsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "24px",
    marginTop: "16px",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.25)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  cardTitle: {
    color: "#00BDD6",
    fontSize: "18px",
    fontWeight: "bold",
    margin: 0,
    maxWidth: "70%",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  cardTitleIcon: {
    flexShrink: 0,
  },
  statusBadgeActive: {
    padding: "6px 10px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
    backgroundColor: "rgba(0, 255, 157, 0.2)",
    color: "#00FF9D",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  statusBadgeHidden: {
    padding: "6px 10px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
    backgroundColor: "rgba(255, 100, 100, 0.2)",
    color: "#FF6464",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  badgeIcon: {
    flexShrink: 0,
  },
  cardBody: {
    marginBottom: "16px",
  },
  cardField: {
    fontSize: "14px",
    color: "#ddd",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  label: {
    color: "#00BDD6",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: "4px",
    minWidth: "100px",
  },
  fieldIcon: {
    flexShrink: 0,
  },
  descriptionContainer: {
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    paddingTop: "12px",
    marginTop: "4px",
    marginBottom: "12px",
  },
  description: {
    fontSize: "13px",
    color: "#bbb",
    lineHeight: 1.5,
    margin: 0,
  },
  readMoreButton: {
    background: "none",
    border: "none",
    color: "#00BDD6",
    fontSize: "13px",
    cursor: "pointer",
    padding: "0",
    marginTop: "8px",
    display: "block",
    fontWeight: 600,
    textDecoration: "underline",
    transition: "color 0.2s ease",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: "16px",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  },
  applicantBadge: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#00FF9D",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  applicantIcon: {
    flexShrink: 0,
  },
  detailsButton: {
    backgroundColor: "#00BDD6",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "8px 12px",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
};

export default VacanciesScreen;
