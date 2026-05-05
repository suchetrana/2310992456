import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1e6f5c"
    },
    secondary: {
      main: "#f4b850"
    },
    background: {
      default: "#f5f6f8",
      paper: "#ffffff"
    }
  },
  typography: {
    fontFamily: "\"Space Grotesk\", \"Segoe UI\", sans-serif",
    h4: {
      fontWeight: 700
    },
    h6: {
      fontWeight: 600
    }
  }
});
