import { Stack, Typography, useTheme } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import "./index.css";
import dayjs, { Dayjs } from "dayjs";
import calendarIcon from '/src/presentation/assets/icons/calendar.svg';

interface DatePickerProps {
  label?: string;
  isRequired?: boolean;
  isOptional?: boolean;
  optionalLabel?: string;
  sx?: object;
  date: Dayjs | null;
  error?: string;
  handleDateChange: (date: Dayjs | null) => void;
}

const DatePicker = ({
  label,
  isRequired,
  isOptional,
  optionalLabel,
  sx,
  date,
  error,
  handleDateChange,
}: DatePickerProps) => {
  const theme = useTheme();

  return (
    <Stack
      sx={{
        "& fieldset": {
          borderColor: theme.palette.border.dark,
          borderRadius: theme.shape.borderRadius,
        },
        "&:not(:has(.Mui-disabled)):not(:has(.input-error)) .MuiOutlinedInput-root:hover:not(:has(input:focus)):not(:has(textarea:focus)) fieldset":
          {
            borderColor: theme.palette.border.dark,
          },
        "&:has(.input-error) .MuiOutlinedInput-root fieldset": {
          border: error
            ? `1px solid ${theme.palette.status.error.border}!important`
            : `1px solid ${theme.palette.border.dark}!important`,
        },
        ".Mui-focused .MuiOutlinedInput-notchedOutline": {
          border: `1px solid ${theme.palette.border.dark}!important`,
        },
      }}
    >
      {label && (
        <Typography
          color={theme.palette.text.secondary}
          fontSize={13}
          fontWeight={500}
          marginBottom={theme.spacing(2)}
        >
          {label}
          {isRequired ? (
            <Typography
              component="span"
              ml={theme.spacing(1)}
              color={theme.palette.error.text}
            >
              *
            </Typography>
          ) : (
            ""
          )}
          {isOptional ? (
            <Typography
              component="span"
              fontSize="inherit"
              fontWeight={400}
              ml={theme.spacing(2)}
              sx={{ opacity: 0.6 }}
            >
              {optionalLabel || "(optional)"}
            </Typography>
          ) : (
            ""
          )}
        </Typography>
      )}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <MuiDatePicker
          className="mui-date-picker"
          sx={{
            ".MuiIconButton-root:hover": { backgroundColor: "unset" },
            "& svg": { display: "none" },
            "& button": {
              position: "absolute",
              left: "14px",
              top: "7px",
              width: "20px",
              height: "20px",
            },
            "& button:before": {
              content: `url(${calendarIcon})`,
              display: "block",
              position: "absolute",
              top: 0,
              left: 0,
            },
            "& .MuiInputBase-root input": {
              position: "absolute",
              left: "36px",
              top: "3px",
              maxWidth: "145px",
            },
            ...sx,
          }}
          value={date ? dayjs(date) : null}
          onChange={(value) => handleDateChange(value)}
          format="MM/DD/YYYY"
        />
      </LocalizationProvider>
      {error && (
        <Typography
          component="span"
          className="input-error"
          color={theme.palette.status.error.text}
          mt={theme.spacing(2)}
          sx={{
            opacity: 0.8,
            fontSize: 11,
          }}
        >
          {error}
        </Typography>
      )}
    </Stack>
  );
};

export default DatePicker;
