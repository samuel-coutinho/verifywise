import React, {
  lazy,
  Suspense,
  useEffect,
  useState,
  useCallback,
  useMemo,
  FC,
} from "react";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { NoProjectBox, styles } from "./styles";
import emptyState from "../../assets/imgs/empty-state.svg";
import { getAllEntities } from "../../../application/repository/entity.repository";
import { ProjectCardProps } from "../../components/ProjectCard";
import useProjectStatus, {
  Assessments,
  Controls,
} from "../../../application/hooks/useProjectStatus";
import VWSkeleton from "../../vw-v2-components/Skeletons";
import { Card } from "../../components/ProjectCard/styles";

// Lazy load components
const ProjectCard = lazy(() => import("../../components/ProjectCard"));
const Popup = lazy(() => import("../../components/Popup"));
const CreateProjectForm = lazy(
  () => import("../../components/CreateProjectForm")
);
const MetricSection = lazy(() => import("../../components/MetricSection"));

// Custom hook for fetching projects
const useProjects = (isNewProject: boolean, resetIsNewProject: () => void) => {
  const [projects, setProjects] = useState<ProjectCardProps[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    getAllEntities({ routeUrl: "/projects" })
      .then(({ data }) => {
        setProjects(data);
        setError(null);
        resetIsNewProject();
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError("Failed to fetch projects: " + err.message);
          setProjects(null);
          resetIsNewProject();
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          resetIsNewProject();
        }
      });
    return () => controller.abort();
  }, [isNewProject]);

  return { projects, error, isLoading };
};

interface HomeProps {
  onProjectUpdate: () => void;
}

const Home: FC<HomeProps> = ({ onProjectUpdate }) => {
  const theme = useTheme();
  const [isNewProject, setIsNewProjectCreate] = useState(false);
  const { projects, error, isLoading } = useProjects(isNewProject, () =>
    setIsNewProjectCreate(false)
  );
  const userId = "1";
  const {
    projectStatus,
    loading: loadingProjectStatus,
    error: errorFetchingProjectStatus,
  } = useProjectStatus({ userId });

  const NoProjectsMessage = useMemo(
    () => (
      <NoProjectBox>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img src={emptyState} alt="Empty project state" />
        </Box>
        <Typography
          sx={{
            textAlign: "center",
            mt: 13.5,
            color: theme.palette.text.tertiary,
          }}
        >
          You have no projects, yet. Click on the "New Project" button to start
          one.
        </Typography>
      </NoProjectBox>
    ),
    [theme]
  );

  const newProjectChecker = (
    data: boolean | ((prevState: boolean) => boolean)
  ) => {
    setIsNewProjectCreate(data);
    if (onProjectUpdate) {
      onProjectUpdate();
    }
  };

  const PopupRender = useCallback(() => {
    const [anchor, setAnchor] = useState<null | HTMLElement>(null);
    const handleOpenOrClose = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        setAnchor(anchor ? null : event.currentTarget);
      },
      [anchor]
    );

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Popup
          popupId="create-project-popup"
          popupContent={
            <CreateProjectForm
              setIsNewProjectCreate={newProjectChecker}
              closePopup={() => setAnchor(null)}
            />
          }
          openPopupButtonName="New project"
          popupTitle="Create new project"
          popupSubtitle="Create a new project from scratch by filling in the following."
          handleOpenOrClose={handleOpenOrClose}
          anchor={anchor}
        />
      </Suspense>
    );
  }, []);

  if (loadingProjectStatus)
    return (
      <VWSkeleton
        variant="rectangular"
        minWidth="200"
        width={"100%"}
        height={"100%"}
        maxWidth="1400"
        minHeight="200"
        maxHeight="100vh"
      />
    );
  if (errorFetchingProjectStatus)
    return (
      <VWSkeleton
        variant="rectangular"
        minWidth="200"
        width={"100%"}
        height={"100%"}
        maxWidth="1400"
        minHeight="200"
        maxHeight="100vh"
      />
    );

  const assessments: Assessments = {
    percentageComplete:
      (projectStatus.assessments.allDoneAssessments ??
        0 / projectStatus.assessments.allTotalAssessments ??
        1) * 100,
    allDoneAssessments: projectStatus.assessments.allDoneAssessments,
    allTotalAssessments: projectStatus.assessments.allTotalAssessments,
    projects: projectStatus.assessments.projects,
  };

  const controls: Controls = {
    percentageComplete:
      (projectStatus.controls.allDoneSubControls ??
        0 / projectStatus.controls.allTotalSubControls ??
        1) * 100,
    allDoneSubControls: projectStatus.controls.allDoneSubControls,
    allTotalSubControls: projectStatus.controls.allTotalSubControls,
    projects: projectStatus.controls.projects,
  };

  const getProjectData = (projectId: number) => {
    const projectAssessments = assessments.projects.find(
      (project: any) => project.projectId === projectId
    ) ?? {
      doneAssessments: 0,
      projectId,
      totalAssessments: 1,
    };

    const projectControls = controls.projects.find(
      (project: any) => project.projectId === projectId
    ) ?? {
      doneSubControls: 0,
      projectId,
      totalSubControls: 0,
    };

    return {
      projectAssessments,
      projectControls,
    };
  };
  return (
    <Box>
      <Box sx={styles.projectBox}>
        <Typography variant="h1" component="div" sx={styles.title}>
          Projects overview
        </Typography>
        <PopupRender />
      </Box>
      {isLoading ? (
        <Typography component="div" sx={{ mb: 12 }}>
          Projects are loading...
        </Typography>
      ) : error ? (
        <Typography component="div" sx={{ mb: 12 }}>
          {error}
        </Typography>
      ) : null}
      {projects && projects.length > 0 ? (
        <>
          <Stack direction="row" justifyContent={projects.length <= 3 ? "space-between" : "flex-start"} flexWrap={projects.length > 3 ? "wrap" : "nowrap"} spacing={15}>
            <Suspense
              fallback={
                <Card>
                  <VWSkeleton
                    variant="rectangular"
                    minWidth="200"
                    width={"100%"}
                    height={"100%"}
                    maxWidth="1400"
                    minHeight="200"
                    maxHeight="100vh"
                  />
                </Card>
              }
            >  
            {projects.length <= 3 ? <>
              {projects.map((item: ProjectCardProps) => (
                <ProjectCard
                  key={item.id}
                  {...item}
                  {...getProjectData(item.id)}
                />
              ))}
            </> : <>
              <Grid sx={{ width: "100%" }} container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>            
                {projects.map((item: ProjectCardProps) => (
                  <Grid key={item.id} size={{ xs: 4, sm: 8, md: 4 }}>
                    <ProjectCard
                      {...item}
                      {...getProjectData(item.id)}
                    />
                  </Grid>
                ))}
              </Grid>
            </>}
            </Suspense>
          </Stack>
          {(["compliance"] as const).map(
            (
              metricType // "risk" was removed from the array, if we wanna the 'All projects risk status' Section back, we need to add it back to the array
            ) => (
              <Suspense
                key={metricType}
                fallback={
                  <VWSkeleton
                    variant="rectangular"
                    minWidth="200"
                    width={"100%"}
                    height={"100%"}
                    maxWidth="1400"
                    minHeight="200"
                    maxHeight="100vh"
                  />
                }
              >
                <MetricSection
                  title={`All projects ${metricType} status`}
                  metricType={metricType}
                  assessments={assessments}
                  controls={controls}
                />
              </Suspense>
            )
          )}
        </>
      ) : (
        NoProjectsMessage
      )}
    </Box>
  );
};

export default Home;
