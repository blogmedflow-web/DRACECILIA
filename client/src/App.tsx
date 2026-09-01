import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Questionnaire from "@/pages/Questionnaire";
import { Route, Router as WouterRouter, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";


function Router() {
  return (
    <WouterRouter hook={useHashLocation}>
      <Switch>
        <Route path={"/"} component={Questionnaire} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

// NOTE: About Theme
// - Design: Elegância Médica Contemporânea
// - Default theme: light (fundo branco com tons quentes)
// - Color palette: Azul-petróleo (#1B4965), bege quente (#E8DCC4), verde-menta (#7FD8BE)
// - Typography: Poppins (títulos) + Inter (corpo)

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
