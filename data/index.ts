import * as developmentCore from "@/data/dummy/core";
import * as developmentCharts from "@/data/dummy/charts";
import * as developmentPlatforms from "@/data/dummy/platforms";
import { productionDummyData } from "@/data/dummy/production";

export const developmentDummyData = {
  ...developmentCore,
  ...developmentCharts,
  ...developmentPlatforms,
};

export { productionDummyData };

export * from "@/data/dummy/core";
export * from "@/data/dummy/charts";
export * from "@/data/dummy/platforms";
