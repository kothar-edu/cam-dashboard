import React from "react";
import { Autocomplete, TextField, Popper, Paper } from "@mui/material";

const StyledAutocomplete = ({
  options = [],
  label = "",
  value,
  onChange,
  placeholder = "Select...",
  ...props
}) => {
  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={onChange}
      getOptionLabel={(option) => option?.label || ""}
      PopperComponent={(props) => <Popper {...props} className="z-50" />}
      PaperComponent={(props) => (
        <Paper
          {...props}
          className="bg-white dark:bg-zinc-800 text-black dark:text-white border border-gray-200 dark:border-zinc-700 shadow-md rounded-md"
        />
      )}
      renderOption={(props, option, { selected }) => (
        <li
          {...props}
          className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 ${
            selected
              ? "bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-white"
              : ""
          }`}
        >
          {option.label}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            sx: {
              bgcolor: "background.paper",
              color: "text.primary",
              borderRadius: "0.5rem",
              px: 1,
              py: 1,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#d1d5db", // tailwind border-gray-300
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#3b82f6", // blue-500
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#3b82f6",
              },
            },
          }}
          InputLabelProps={{
            sx: {
              color: "text.secondary",
              "&.Mui-focused": {
                color: "#3b82f6", // blue-500
              },
            },
          }}
        />
      )}
      {...props}
    />
  );
};

export default StyledAutocomplete;
