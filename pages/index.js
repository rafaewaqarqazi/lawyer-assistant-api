import LandingPageLayout from "../components/Layouts/LandingPageLayout";
import {withLandingAuthSync} from "../components/routers/landingAuth";
import SignInComponent from "../components/SignInComponent";

const Index = () => {
  return (
    <LandingPageLayout>
      <SignInComponent/>
    </LandingPageLayout>
  );
};


export default withLandingAuthSync(Index);