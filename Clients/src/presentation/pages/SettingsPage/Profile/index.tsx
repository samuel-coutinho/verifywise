import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  useMemo,
} from "react";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material";
import Field from "../../../components/Inputs/Field";
import Avatar from "../../../components/Avatar/VWAvatar/index";
import { checkStringValidation } from "../../../../application/validations/stringValidation";
import validator from "validator";
import { logEngine } from "../../../../application/tools/log.engine";
import localStorage from "redux-persist/es/storage";
import DualButtonModal from "../../../vw-v2-components/Dialogs/DualButtonModal";

/**
 * Interface representing a user object.
 * @interface
 */
interface User {
  firstname: string;
  lastname: string;
  email: string;
  pathToImage: string;
}

/**
 * ProfileForm component for managing user profile information.
 *
 * This component allows users to view and update their profile information,
 * including their first name, last name, email, and profile photo. It also
 * provides functionality to delete the user's account.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 */
const ProfileForm: React.FC = () => {
  // State management
  const [firstname, setFirstname] = useState<string>("");
  const [lastname, setLastname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [profilePhoto, setProfilePhoto] = useState<string>(
    "/placeholder.svg?height=80&width=80"
  );

  const [firstnameError, setFirstnameError] = useState<string | null>(null);
  const [lastnameError, setLastnameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Fetch user data on component mount.
   *
   * Retrieves the user data from the server and sets the state with the
   * retrieved information.
   */
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {

        const userId = (await localStorage.getItem("userId")) || "1";
        if (!userId) {
          throw new Error("User ID not found in local storage");
        }

        const response = await fetch(`http://localhost:3000/users/${userId}`);
        if (!response) {
          throw new Error("failed to fetch user data");
        }
        const user = await response.json();


        setFirstname(response.data.name || "");
        setLastname(response.data.surname || "");
        setEmail(response.data.email || "");
        setProfilePhoto(
          response.data.pathToImage || "/placeholder.svg?height=80&width=80"
        );
      } catch (error) {
        logEngine({
          type: "error",
          message: "Failed to fetch user data.",
          user: {

            id: "N/A",
            email: "N/A",
            firstname: "N/A",
            lastname: "N/A",
          },
        });
        console.error("error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  /**
   * Handle save button click with validation.
   *
   * Validates the input fields and updates the user profile information
   * on the server if there are no validation errors.
   */
  const handleSave = useCallback(async () => {
    try {
      if (firstnameError || lastnameError || emailError) {
        alert("validation errors need to be fixed before saving");
        return;
      }
      const userId = (await localStorage.getItem("userId")) || "1";
      if (!userId) {
        throw new Error("user id not found in local storage");
      }

      const updatedUser = {
        firstname,
        lastname,
        email,
        pathToImage: profilePhoto,
      };

      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });
      if (!response.ok) {
        throw new Error("failed to update user");
      }
      alert("Profile updated successfully");
    } catch (error) {
      console.error("error updating user", error);
      alert("failed to update profile, please try again");
    }
  }, [
    firstname,
    lastname,
    email,
    profilePhoto,
    firstnameError,
    lastnameError,
    emailError,
  ]);

  /**
   * Handle file input change.
   *
   * Updates the profile photo with the selected file.
   *
   * @param {ChangeEvent<HTMLInputElement>} event - The change event.
   */
  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      const file = event.target.files?.[0];
      if (file) {
        const newPhotoUrl = URL.createObjectURL(file);
        setProfilePhoto(newPhotoUrl);
      }
    },
    []
  );

  /**
   * Handle delete dialog open.
   *
   * Opens the delete account confirmation dialog.
   */
  const handleOpenDeleteDialog = useCallback((): void => {
    setIsDeleteModalOpen(true);
  }, []);

  /**
   * Handle delete dialog close.
   *
   * Closes the delete account confirmation dialog.
   */
  const handleCloseDeleteDialog = useCallback((): void => {
    setIsDeleteModalOpen(false);
  }, []);

  /**
   * Handle update photo button click.
   *
   * Triggers the file input click to update the profile photo.
   */
  const handleUpdatePhoto = useCallback((): void => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Handle delete photo button click.
   *
   * Resets the profile photo to the default placeholder.
   */
  const handleDeletePhoto = useCallback((): void => {
    setProfilePhoto("/placeholder.svg?height=80&width=80");
  }, []);

  /**
   * Handle firstname input change with validation.
   *
   * Validates the first name input and updates the state.
   *
   * @param {ChangeEvent<HTMLInputElement>} e - The change event.
   */
  const handleFirstnameChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newFirstname = e.target.value;
      setFirstname(newFirstname);

      const validation = checkStringValidation(
        "First name",
        newFirstname,
        2,
        50,
        false,
        false
      );
      setFirstnameError(validation.accepted ? null : validation.message);
    },
    []
  );

  /**
   * Handle lastname input change with validation.
   *
   * Validates the last name input and updates the state.
   *
   * @param {ChangeEvent<HTMLInputElement>} e - The change event.
   */
  const handleLastnameChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newLastname = e.target.value;
      setLastname(newLastname);

      const validation = checkStringValidation(
        "Last name",
        newLastname,
        2,
        50,
        false,
        false
      );
      setLastnameError(validation.accepted ? null : validation.message);
    },
    []
  );

  /**
   * Handle email input change with validation.
   *
   * Validates the email input and updates the state.
   *
   * @param {ChangeEvent<HTMLInputElement>} e - The change event.
   */
  const handleEmailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    if (!validator.isEmail(newEmail)) {
      setEmailError("Invalid email address");
    } else {
      setEmailError(null);
    }
  }, []);

  /**
   * Close confirmation modal.
   *
   * Closes the save changes confirmation modal.
   */
  const handleCloseConfirmationModal = useCallback(() => {
    setIsSaveModalOpen(false);
  }, []);

  /**
   * Handle save confirmation.
   *
   * Proceeds with saving the profile.
   */
  const handleConfirmSave = useCallback(() => {
    handleSave();
    setIsSaveModalOpen(false);
  }, [handleSave]);

  /**
   * Handle delete confirmation.
   *
   * Proceeds with deleting the account.
   */
  const handleConfirmDelete = useCallback(() => {
    // Add delete account logic here
    setIsDeleteModalOpen(false);
  }, []);

  // User object for Avatar component
  const user: User = useMemo(
    () => ({
      firstname,
      lastname,
      pathToImage: profilePhoto,
      email,
    }),
    [firstname, lastname, profilePhoto, email]
  );

  return (
    <Box sx={{ position: "relative", mt: 3, width: { xs: "90%", md: "70%" } }}>
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.8)",
            zIndex: 10,
          }}
        >
          <Typography>Loading...</Typography>
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: { xs: "column", md: "row" },
          mb: 3,
          width: "100%",
          mt: 20,
        }}
      >
        <Box sx={{ width: { xs: "100%", md: "40%" } }}>
          <Field
            id="First name"
            label="Name"
            value={firstname}
            onChange={handleFirstnameChange}
            sx={{ mb: 5, backgroundColor: "#FFFFFF" }}
          />
          {firstnameError && (
            <Typography color="error" variant="caption">
              {firstnameError}
            </Typography>
          )}
          <Field
            id="Last name"
            label="Surname"
            value={lastname}
            onChange={handleLastnameChange}
            sx={{ mb: 5, backgroundColor: "#FFFFFF" }}
          />
          {lastnameError && (
            <Typography color="error" variant="caption">
              {lastnameError}
            </Typography>
          )}
          <Field
            id="Email"
            label="Email"
            value={email}
            onChange={handleEmailChange}
            sx={{ mb: 5, backgroundColor: "#FFFFFF" }}
            disabled
          />
          {emailError && (
            <Typography color="error" variant="caption">
              {emailError}
            </Typography>
          )}
          <Typography
            variant="caption"
            sx={{ mt: 1, display: "block", color: "#667085" }}
          >
            This is your current email address — it cannot be changed.
          </Typography>
        </Box>
        <Box sx={{ width: { xs: "100%", md: "40%" }, textAlign: "center" }}>
          <Stack direction="column" alignItems="center" spacing={2}>
            <Typography
              fontWeight="600"
              variant="subtitle1"
              color="#344054"
              pb={theme.spacing(5)}
            >
              Your photo
            </Typography>
            <Avatar user={user} size="medium" sx={{ width: 80, height: 80 }} />
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleFileChange}
            />
            <Stack
              direction="row"
              spacing={2}
              alignItems={"center"}
              sx={{ paddingTop: theme.spacing(10) }}
            >
              <Typography
                sx={{
                  color: "#667085",
                  cursor: "pointer",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                  fontSize: 13,
                }}
                onClick={handleDeletePhoto}
              >
                Delete
              </Typography>
              <Typography
                sx={{
                  color: "#4C7DE7",
                  cursor: "pointer",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                  paddingLeft: theme.spacing(5),
                  fontSize: 13,
                }}
                onClick={handleUpdatePhoto}
              >
                Update
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Box>
      <Stack
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <Button
          disableRipple
          variant="contained"
          sx={{
            width: { xs: "100%", sm: theme.spacing(80) },
            mb: theme.spacing(4),
            backgroundColor: "#4c7de7",
            color: "#fff",
            position: { md: "relative" },
            left: { md: theme.spacing(0) },
            mt: theme.spacing(5),
            "&:hover": {
              backgroundColor: "#175CD3 ",
            },
          }}
          onClick={() => setIsSaveModalOpen(true)}
        >
          Save
        </Button>
      </Stack>

      <Divider sx={{ borderColor: "#C2C2C2", mt: theme.spacing(3) }} />


      {/* Confirmation modal */}
      <Dialog
        open={isConfirmationModalOpen}
        onClose={handleCloseConfirmationModal}
      >
        <DialogTitle>Save Changes?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to save the changes?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmationModal}>Cancel</Button>
          <Button
            onClick={handleSave}
            color="primary"
            aria-label="Save profile changes"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Box>
        <Stack>
          <Typography fontWeight={"600"} gutterBottom sx={{ mb: 2, mt: 10 }}>
            Delete account
          </Typography>
          <Typography
            fontWeight={"400"}
            variant="body2"
            sx={{ mb: 8, mt: 4, color: "#667085" }}
          >
            Note that deleting your account will remove all data from our
            system. This is permanent and non-recoverable.
          </Typography>
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Button
              disableRipple
              variant="contained"
              onClick={handleOpenDeleteDialog}
              sx={{
                width: { xs: "100%", sm: theme.spacing(80) },
                mb: theme.spacing(4),
                backgroundColor: "#DB504A",
                color: "#fff",
              }}
            >
              Delete account
            </Button>
          </Stack>
        </Stack>
      </Box>
      {isSaveModalOpen && (
        <DualButtonModal
          title="Confirm Save"
          body={
            <Typography fontSize={13}>
              Are you sure you want to save the changes?
            </Typography>
          }
          cancelText="Cancel"
          proceedText="Save"
          onCancel={handleCloseConfirmationModal}
          onProceed={handleConfirmSave}
          proceedButtonColor="primary"
          proceedButtonVariant="contained"
        />
      )}

      {isDeleteModalOpen && (
        <DualButtonModal
          title="Confirm Delete"
          body={
            <Typography fontSize={13}>
              Are you sure you want to delete your account? This action is
              permanent and cannot be undone.
            </Typography>
          }
          cancelText="Cancel"
          proceedText="Delete"
          onCancel={handleCloseDeleteDialog}
          onProceed={handleConfirmDelete}
          proceedButtonColor="error"
          proceedButtonVariant="contained"
        />
      )}
    </Box>
  );
};

export default ProfileForm;
