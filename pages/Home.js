import React from "react";
import ScreenWrapper from "../components/Screenwrapper";
import Hero from "../components/Hero";
import AvatarSection from "../components/avtorsection";
import LeaderboardBattleSection from "../components/Leaderboardbattlesection";
import PaperGrid from "../components/PaperGrid";

export default function Home({ navigation }) {
  return (
    <ScreenWrapper>
      <Hero />
      <LeaderboardBattleSection navigation={navigation} />
      <AvatarSection navigation={navigation} />
      <PaperGrid />
    </ScreenWrapper>
  );
}