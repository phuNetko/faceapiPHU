import { configureStore } from "@reduxjs/toolkit";
import statusAppReducer from "./statusSlice";

const store = configureStore({
  reducer: {
    statusApp: statusAppReducer,
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
