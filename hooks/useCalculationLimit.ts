import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

const STORAGE_KEY = "daily_calculations";
const FREE_DAILY_LIMIT = 5;

interface DailyData {
  date: string;
  count: number;
}

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0]; // "2026-02-17"
}

export function useCalculationLimit(isPro: boolean) {
  const [dailyCount, setDailyCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const remaining = Math.max(0, FREE_DAILY_LIMIT - dailyCount);

  // Disable limit on Android since there is no Pro plan
  const hasReachedLimit =
    Platform.OS === "android"
      ? false
      : !isPro && dailyCount >= FREE_DAILY_LIMIT;

  // Load the current count on mount
  useEffect(() => {
    loadDailyCount();
  }, []);

  const loadDailyCount = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data: DailyData = JSON.parse(raw);
        if (data.date === getTodayKey()) {
          setDailyCount(data.count);
        } else {
          // New day, reset count
          setDailyCount(0);
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (e) {
      console.error("Error loading calculation count:", e);
    } finally {
      setIsLoaded(true);
    }
  };

  const incrementCount = useCallback(async () => {
    try {
      const newCount = dailyCount + 1;
      const data: DailyData = {
        date: getTodayKey(),
        count: newCount,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setDailyCount(newCount);
    } catch (e) {
      console.error("Error saving calculation count:", e);
    }
  }, [dailyCount]);

  return {
    dailyCount,
    remaining,
    hasReachedLimit,
    incrementCount,
    isLoaded,
    FREE_DAILY_LIMIT,
  };
}
