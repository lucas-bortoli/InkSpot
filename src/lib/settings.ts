interface AppSettings {
  serverUrl: string;
}

const defaults: AppSettings = {
  serverUrl: "https://pathfinder.tail6959.ts.net:5002",
};

export function getSettings(): AppSettings {
  try {
    return {
      ...defaults,
      ...JSON.parse(localStorage.getItem("settings") ?? "{}"),
    };
  } catch (error) {
    return {
      ...defaults,
    };
  }
}

export function setSettings(factory: (previous: AppSettings) => AppSettings) {
  localStorage.setItem("settings", JSON.stringify(factory(getSettings())));
}
