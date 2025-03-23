import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface StatusAppState {
  isLoading: boolean;
}

const initialState: StatusAppState = {
  isLoading: false,
};

const statusAppSlice = createSlice({
  name: "statusApp",
  initialState,
  reducers: {
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setIsLoading } = statusAppSlice.actions;
export default statusAppSlice.reducer;
