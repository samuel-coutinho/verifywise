/**
 * Generates a markdown report for vendor risks
 * @param projectId - The ID of the project
 * @param data - Project metadata including title and owner
 * @returns Promise<string> - Markdown formatted vendor risk report
 */

import { getUserByIdQuery } from "../../utils/user.utils";
import { getVendorByProjectIdQuery } from "../../utils/vendor.utils";
import { getVendorRisksByProjectIdQuery } from "../../utils/vendorRisk.util";
import { ReportBodyData } from "../reportService";

export async function getVendorReportMarkdown(
    projectId: number,
    data: ReportBodyData
  ): Promise<any> {
    const vendorData = await getVendorByProjectIdQuery(projectId);
    const riskData = await getVendorRisksByProjectIdQuery(projectId);
  
    const vendorRows: string =
      vendorData && vendorData.length > 0
        ? await Promise.all(
            vendorData.map(async (vendor) => {
              const vendorAssignee = await getUserByIdQuery(vendor.assignee);
              return `| ${vendor.vendor_name} | ${vendorAssignee.name} ${
                vendorAssignee.surname
              } | ${vendor.review_status} | ${
                vendor.risk_status
              } | ${vendor.review_date.toLocaleDateString()} |`;
            })
          ).then((rows) => rows.join("\n"))
        : "| - | - | - | - | - |";
  
    const riskRows: string =
      riskData && riskData.length > 0
        ? await Promise.all(
            riskData.map(async (risk) => {
              const riskActionOwner = await getUserByIdQuery(risk.action_owner);
              return `| ${risk.impact} | ${risk.likelihood} | ${risk.risk_severity} | ${riskActionOwner.name} ${riskActionOwner.surname} | ${risk.risk_level} | ${risk.risk_description} |`;
            })
          ).then((rows) => rows.join("\n"))
        : "| - | - | - | - | - | - |";
  
    return `
  VerifyWise vendors and vendor risks report
  -------------
  This report is generated by VerifyWise. It aims to give information about the company's vendors and corresponding vendor risks.
    
  - **Date**: ${new Date().toLocaleDateString()}
  - **Project**: ${data.projectTitle}
  - **Owner**: ${data.projectOwner}
  
  Vendors table
  -------------
  | Vendor Name | Assignee | Review Status | Risk Status | Review Date |
  |----|----|----|----|----|
  ${vendorRows}
  
  Vendor risk table
  -------------
  | Impact | Likelihood | Risk Severity | Action Owner | Risk Level | Risk Description |
  |----|----|----|----|----|----|
  ${riskRows}
  `;
}
  