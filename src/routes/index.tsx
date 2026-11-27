import { AppPageContainer } from "../components/app/AppPageContainer";
import { LandingPage } from "../components/landing/LandingPage";
import { LandingSeo } from "../components/landing/LandingSeo";

export default function Home() {
  return (
    <main id="main-content" class="flex min-h-0 flex-1 flex-col bg-canvas">
      <LandingSeo />
      <AppPageContainer>
        <LandingPage />
      </AppPageContainer>
    </main>
  );
}
