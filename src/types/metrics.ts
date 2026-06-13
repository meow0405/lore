export interface QualityData {
  test_count: number;
  test_coverage: number;
  lint_violation_count: number;
  code_smell_count: number;
  security_warning_count: number;
}

export interface RepoInformation {
  repo_name: string;
  repo_language: string;
  repo_framework: string;
  repo_default_branch: string;
}

export interface FileInformation {
  file_path: string;
  file_name: string;
  file_extension: string;
  file_module: string;
  file_size_bytes: number;
  file_loc: number;
  file_age_days: number;
}

export interface AnalyticsReport {
  repoInformation: RepoInformation;
  fileInformation: FileInformation;
  metrics: {
    file_count: number;
    commit_with_others: number;
    unique_files_importing: number;
    dependency_config_changes: number;
    treesitter_comment_lines: number;
    bus_factor: number;
    halstead_volume: number;
    cyclomatic_complexity: number;
    comment_lines_count: number;
    duplicated_lines: number;
    review_comment_count: number;
  };
  qualityData: QualityData;
}
