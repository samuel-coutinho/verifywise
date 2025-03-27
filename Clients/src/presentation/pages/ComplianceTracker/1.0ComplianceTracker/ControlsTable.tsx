/**
 * This file is currently in use
 */

import {
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  Box,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import singleTheme from "../../../themes/v1SingleTheme";
import { getEntityById } from "../../../../application/repository/entity.repository";
import { Control } from "../../../../domain/Control";
import VWSkeleton from "../../../vw-v2-components/Skeletons";
import NewControlPane from "../../../components/Modals/Controlpane/NewControlPane";
import Alert from "../../../components/Alert";

const cellStyle = {
  ...singleTheme.tableStyles.primary.body.row,
  height: "36px",
  "&:hover": {
    backgroundColor: "#FBFBFB",
    cursor: "pointer",
  },
};

const descriptionCellStyle = {
  ...cellStyle,
  maxWidth: "450px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

interface Column {
  name: string;
}

interface ControlsTableProps {
  controlCategoryId: number;
  controlCategoryIndex: number;
  columns: Column[];
  onComplianceUpdate?: () => void;
  flashRow?: number | null;
}

const flashAnimation = {
  "@keyframes flashBackground": {
    "0%": { backgroundColor: "#FFFFFF" },
    "50%": { backgroundColor: "#E8F5E9" },
    "100%": { backgroundColor: "#FFFFFF" },
  },
};

const getRowStyle = (rowId: number | undefined | null, flashRowId: number | null) => ({
  ...cellStyle,
  backgroundColor: rowId === flashRowId ? "#E8F5E9" : "inherit",
  transition: "background-color 0.3s ease-in-out"
});

const ControlsTable: React.FC<ControlsTableProps> = ({
  controlCategoryId,
  controlCategoryIndex,
  columns,
  onComplianceUpdate,
  flashRow
}) => {
  const theme = useTheme();
  const [controls, setControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentFlashRow, setCurrentFlashRow] = useState<number | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleRowClick = (id: number) => {
    setSelectedRow(id);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRow(null);
  };

  const handleControlUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
    if (onComplianceUpdate) {
      onComplianceUpdate();
    }
  };

  const handleSaveSuccess = (control: Control) => {
    handleControlUpdate();
    handleCloseModal();
    if (control.id) {
      setCurrentFlashRow(control.id);
      setTimeout(() => {
        setCurrentFlashRow(null);
      }, 2000);
    }
    // Show success notification
    setAlert({
      type: "success",
      message: "Control updated successfully"
    });
    setTimeout(() => {
      setAlert(null);
    }, 2000);
  };

  useEffect(() => {
    const fetchControls = async () => {
      setLoading(true);
      try {
        const response = await getEntityById({
          routeUrl: `/controls/all/bycategory/${controlCategoryId}`,
        });
        setControls(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchControls();
  }, [controlCategoryId, refreshTrigger]);

  const getProgressColor = useCallback((value: number) => {
    if (value <= 10) return "#FF4500"; // 0-10%
    if (value <= 20) return "#FF4500"; // 11-20%
    if (value <= 30) return "#FFA500"; // 21-30%
    if (value <= 40) return "#FFD700"; // 31-40%
    if (value <= 50) return "#E9F14F"; // 41-50%
    if (value <= 60) return "#CDDD24"; // 51-60%
    if (value <= 70) return "#64E730"; // 61-70%
    if (value <= 80) return "#32CD32"; // 71-80%
    if (value <= 90) return "#228B22"; // 81-90%
    return "#008000"; // 91-100%
  }, []);

  if (loading) {
    return (
      <Stack spacing={2}>
        <VWSkeleton variant="rectangular" width="100%" height={36} />
        <VWSkeleton variant="rectangular" width="100%" height={36} />
        <VWSkeleton variant="rectangular" width="100%" height={36} />
      </Stack>
    );
  }

  if (error) {
    return <div>Error loading controls</div>;
  }

  return (
    <>
      {alert && (
        <Box
          sx={{
            position: "fixed",
            top: theme.spacing(2),
            right: theme.spacing(2),
            zIndex: 9999,
            width: "auto",
            maxWidth: "400px",
            textAlign: "left"
          }}
        >
          <Alert
            variant={alert.type}
            body={alert.message}
            isToast={true}
            onClick={() => setAlert(null)}
            sx={{
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
            }}
          />
        </Box>
      )}
      <TableContainer className="controls-table-container">
        <Table className="controls-table">
          <TableHead
            sx={{
              backgroundColors:
                singleTheme.tableStyles.primary.header.backgroundColors,
            }}
          >
            <TableRow>
              {columns.map((col: Column, index: number) => (
                <TableCell
                  key={index}
                  sx={singleTheme.tableStyles.primary.header.cell}
                >
                  {col.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {controls
              .sort((a, b) => (a.order_no ?? 0) - (b.order_no ?? 0))
              .map((control: Control) => (
                <TableRow
                  key={control.id}
                  onClick={() =>
                    control.id !== undefined && handleRowClick(control.id)
                  }
                >
                  {modalOpen && selectedRow === control.id && (
                    <NewControlPane
                      data={control}
                      isOpen={modalOpen}
                      handleClose={handleCloseModal}
                      OnSave={handleSaveSuccess}
                      controlCategoryId={control.order_no?.toString()}
                      onComplianceUpdate={onComplianceUpdate}
                    />
                  )}
                  <TableCell
                    sx={descriptionCellStyle}
                    key={`${controlCategoryId}-${control.id}`}
                    style={{ backgroundColor: currentFlashRow === control.id ? '#e3f5e6': ''}}
                  >
                    {controlCategoryIndex}.{`${control.order_no}`} {control.title}{" "}
                    <span style={{color: 'grey' }}>{`(${control.description})`}</span>
                  </TableCell>
                  <TableCell 
                    sx={cellStyle} 
                    key={`owner-${control.id}`}
                    style={{ backgroundColor: currentFlashRow === control.id ? '#e3f5e6': ''}}
                  >
                    {control.owner ? control.owner : "Not set"}
                  </TableCell>
                  <TableCell 
                    sx={cellStyle} 
                    key={`noOfSubControls-${control.id}`}
                    style={{ backgroundColor: currentFlashRow === control.id ? '#e3f5e6': ''}}
                  >
                    {`${control.numberOfSubcontrols} Subcontrols`}
                  </TableCell>
                  <TableCell 
                    sx={cellStyle} 
                    key={`completion-${control.id}`}
                    style={{ backgroundColor: currentFlashRow === control.id ? '#e3f5e6': ''}}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2">
                        {`${control.numberOfSubcontrols
                          ? (
                            (control.numberOfDoneSubcontrols! /
                              control.numberOfSubcontrols) * 100
                          ).toFixed(0)
                          : "0"
                          }%`}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={
                          control.numberOfSubcontrols
                            ? ((control.numberOfDoneSubcontrols ?? 0) /
                              control.numberOfSubcontrols) *
                            100
                            : 0
                        }
                        sx={{
                          width: "100px",
                          height: "5px",
                          borderRadius: "4px",
                          backgroundColor: theme.palette.grey[200],
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: getProgressColor(
                              control.numberOfSubcontrols
                                ? ((control.numberOfDoneSubcontrols ?? 0) /
                                  control.numberOfSubcontrols) *
                                100
                                : 0
                            ),
                          },
                        }}
                      />
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ControlsTable;