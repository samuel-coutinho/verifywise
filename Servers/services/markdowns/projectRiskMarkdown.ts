/**
 * Generates a markdown report for project risks
 * @param projectId - The ID of the project
 * @param data - Project metadata including title and owner
 * @returns Promise<string> - Markdown formatted project risk report
 */

import { getProjectRisksReportQuery } from "../../utils/reporting.utils";
import { ReportBodyData } from '../reportService';

export interface ProjectRiskProps {
  risk_owner_name: string;
  risk_owner_surname: string;
  deadline: any;
  risk_level_autocalculated: any;
  approval_status: any;
  likelihood: any;
  risk_severity: any;
  risk_name: string,
  risk_owner: string | any
}

export async function getProjectRiskMarkdown (
    projectId: number,
    data: ReportBodyData
  ) : Promise<string> {
  const reportData = await getProjectRiskReportData(projectId);

  const projectRiskMD = `
${data.organizationName || 'VerifyWise'} project risk report
========================

This report is generated by the VerifyWise Project Risk. It aims to provide a way to demonstrate their claims about the risks of their AI systems.
  
- **Date** ${new Date().toLocaleDateString()}
- **Project** ${data.projectTitle}
- **Owner** ${data.projectOwner}

Project risk table
-------------
${reportData}
`
  return projectRiskMD;
}

/**
 * Retrieves all project risk data from DB
 * @param projectId - The ID of the project
 * @returns Promise<string> - Project risk table markdown
 */
export async function getProjectRiskReportData (
  projectId: number
) : Promise<string> {
  let rows: string =``;
  try {
    const reportData = await getProjectRisksReportQuery(projectId) as ProjectRiskProps[];

    rows = (reportData.length > 0) 
    ? reportData.map((risk: ProjectRiskProps) => 
        `| ${risk.risk_name} | ${risk.risk_owner_name} ${risk.risk_owner_surname} | ${risk.risk_severity} | ${risk.likelihood} | ${risk.approval_status} | ${risk.risk_level_autocalculated} | ${risk.deadline ? new Date(risk.deadline).toLocaleDateString() : 'N/A'} |`
      ).join('\n') 
    : `| - | - | - | - | - | - | - |`;
    
  } catch (error){
    console.error(error);
    throw new Error(`Error while fetching the project risk report data`);    
  }

  const markdown = `
| Risk Name | Owner | Severity | Likelihood | Mitigation Status	| Risk Level | Target Date | 
|----|----|----|----|----|----|----|
${rows}
`
  return markdown;
}