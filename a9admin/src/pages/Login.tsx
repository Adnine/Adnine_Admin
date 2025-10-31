import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// 1. Import the image's URL (path)
import unionLogo from "../assets/icons/Union.svg";

// ... (Popup component code remains the same) ...
interface SavedAccount {
  id: string;
  email: string;
  password?: string;
  name: string;
  profilePicture: string | null;
}
interface PopupProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  buttonText: string;
  onButtonPress: () => void;
}
const Popup: React.FC<PopupProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  buttonText,
  onButtonPress,
}) => {
  if (!visible) return null;
  return (
    <div style={styles.popupOverlay} onClick={onClose}>
      <div style={styles.popupContent} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.popupTitle}>{title}</h3>
        <p style={styles.popupSubtitle}>{subtitle}</p>
        <div style={styles.popupButtons}>
          <button style={styles.popupCancelButton} onClick={onClose}>
            Cancel
          </button>
          <button style={styles.popupButton} onClick={onButtonPress}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};
// --- Main Login Component ---
const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<SavedAccount | null>(
    null
  );
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const savedAccountsData = localStorage.getItem("savedAccounts");
      if (savedAccountsData) {
        setSavedAccounts(JSON.parse(savedAccountsData));
      }
    } catch (error) {
      console.error("Error retrieving saved accounts:", error);
    }
  }, []);

  const handleLogin = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      if (email === "admin@example.com" && password === "123456") {
        const mockUserData = {
          user: { id: "1", mode: "admin" },
          access_token: "mock_access_token",
          refresh_token: "mock_refresh_token",
          username: "Admin User",
          profile_picture_url: null,
        };
        localStorage.setItem("access_token", mockUserData.access_token);
        localStorage.setItem("refresh_token", mockUserData.refresh_token);
        localStorage.setItem("user_id", mockUserData.user.id);
        console.log("Redux dispatch would happen here.");
        navigate("/home");
      } else {
        alert("Invalid credentials");
      }
    } catch (error: any) {
      console.error("Error during login:", error.message);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      setIsPopupVisible(false);
    }
  };

  const handleDeleteAccount = (accountEmail: string) => {
    try {
      const updatedAccounts = savedAccounts.filter(
        (account) => account.email !== accountEmail
      );
      localStorage.setItem("savedAccounts", JSON.stringify(updatedAccounts));
      setSavedAccounts(updatedAccounts);
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const handleAccountClick = (account: SavedAccount) => {
    setSelectedAccount(account);
    setEmail(account.email);
    setPassword(account.password || "");
    setIsPopupVisible(true);
  };

  const handlePopupConfirm = () => {
    handleLogin();
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        {/* 2. Use an <img> tag with the imported path */}
        <img src={unionLogo} alt="Logo" style={styles.logo} />

        <h2 style={styles.headerTitle}>A9 Admin Login</h2>
        {/* --- Saved Accounts Section --- */}
        {savedAccounts.length > 0 && (
          <div style={styles.savedAccountsContainer}>
            <h3 style={styles.savedAccountsTitle}>
              Login with a saved account
            </h3>
            <div style={styles.accountsScrollView}>
              {savedAccounts.map((account, index) => (
                <div key={index} style={styles.accountItem}>
                  <div
                    style={styles.accountInfo}
                    onClick={() => handleAccountClick(account)}
                  >
                    <div style={styles.avatar}>
                      {account.profilePicture ? (
                        <img
                          src={account.profilePicture}
                          alt={account.name}
                          style={styles.avatarImage}
                        />
                      ) : (
                        <span style={styles.avatarFallback}>
                          {account.name[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span style={styles.accountName}>{account.name}</span>
                  </div>
                  <button
                    style={styles.deleteButton}
                    onClick={() => handleDeleteAccount(account.email)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* --- Login Form --- */}
        <form onSubmit={handleLogin}>
          <h3 style={styles.loginTitle}>Login</h3>
          <input
            type="email"
            placeholder="Enter email or mobile number"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <div style={styles.optionsContainer}>
            <a href="#forgot-password" style={styles.forgotLink}>
              Forgot password?
            </a>
          </div>
          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
      <Popup
        visible={isPopupVisible}
        onClose={() => setIsPopupVisible(false)}
        title="Login"
        subtitle={`Are you sure you want to login with ${selectedAccount?.name}?`}
        buttonText="Continue"
        onButtonPress={handlePopupConfirm}
      />
    </div>
  );
};

// --- Styles (Translated from React Native) ---

type StyleObject = React.CSSProperties;
type StyleMap = {
  [key: string]: StyleObject;
};

const styles: StyleMap = {
  // 3. Add the 'logo' style
  logo: {
    width: "145px",
    height: "145px",
    alignSelf: "center",
    marginBottom: "16px", // Added margin
  },
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    padding: "16px",
    background: "linear-gradient(to bottom, #160F24, #24213C, #2E1F3A)",
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
    color: "#f0f0f0",
  },
  formContainer: {
    width: "100%",
    maxWidth: "400px",
    display: "flex",
    flexDirection: "column",
  },
  headerTitle: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center" as const,
    marginBottom: "24px",
  },
  loginTitle: {
    color: "#00BDD6", // baby-blue
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "16px",
  },
  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "16px",
    borderRadius: "8px",
    border: "1px solid #444",
    backgroundColor: "#292d44",
    color: "#fff",
    fontSize: "16px",
    boxSizing: "border-box" as const,
  },
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "50px", // rounded-full
    border: "none",
    backgroundColor: "#00BDD6", // A standard blue
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    opacity: 1,
  },
  optionsContainer: {
    display: "flex",
    justifyContent: "flex-end", // <-- UPDATED from space-between
    alignItems: "center",
    marginBottom: "24px",
    marginTop: "8px",
  },
  labelText: {
    color: "#00BDD6", // baby-blue
    fontSize: "14px",
    marginLeft: "8px",
  },
  forgotLink: {
    color: "#00BDD6", // baby-blue
    fontSize: "14px",
    textDecoration: "none",
  },
  savedAccountsContainer: {
    marginTop: "16px",
    marginBottom: "24px",
  },
  savedAccountsTitle: {
    color: "#00BDD6",
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  accountsScrollView: {
    maxHeight: "230px",
    overflowY: "auto" as const,
    paddingRight: "8px", // for scrollbar
  },
  accountItem: {
    backgroundColor: "#292d44",
    borderRadius: "10px",
    padding: "12px",
    margin: "4px 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  accountInfo: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    flexGrow: 1,
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "20px",
    backgroundColor: "#555",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: "12px",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },
  avatarFallback: {
    fontSize: "18px",
    color: "#fff",
    fontWeight: "bold",
  },
  accountName: {
    color: "#00BDD6",
    fontSize: "18px",
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#e74c3c", // red
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "5px 10px",
    cursor: "pointer",
    marginLeft: "10px",
  },
  popupOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  popupContent: {
    backgroundColor: "#fff",
    color: "#333",
    padding: "24px",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "400px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  popupTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    margin: "0 0 8px 0",
  },
  popupSubtitle: {
    fontSize: "16px",
    color: "#555",
    margin: "0 0 24px 0",
  },
  popupButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  popupCancelButton: {
    padding: "10px 16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    backgroundColor: "#f9f9f9",
    color: "#333",
    fontSize: "16px",
    cursor: "pointer",
  },
  popupButton: {
    padding: "10px 16px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default Login;
