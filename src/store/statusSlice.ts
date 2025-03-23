import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface StatusAppState {
  isLoading: boolean;
  isOpenVideo: boolean;
}

const initialState: StatusAppState = {
  isLoading: false,
  isOpenVideo: false,
};

const statusAppSlice = createSlice({
  name: "statusApp",
  initialState,
  reducers: {
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setIsOpenVideo: (state, action: PayloadAction<boolean>) => {
      state.isOpenVideo = action.payload;
    },
  },
});

export const { setIsLoading, setIsOpenVideo } = statusAppSlice.actions;
export default statusAppSlice.reducer;
