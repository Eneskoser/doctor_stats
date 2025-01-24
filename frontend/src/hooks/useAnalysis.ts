import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analysisService } from '../api/services';
import {
  Analysis,
  AnalysisRequest,
  AnalysisType,
  AnalysisConfig,
  AnalysisResult,
} from '../types/analysis';

export const useAnalysis = (datasetId?: string) => {
  const queryClient = useQueryClient();

  // Query for listing analyses
  const {
    data: analyses,
    isLoading: isLoadingAnalyses,
    error: analysesError,
  } = useQuery({
    queryKey: ['analyses', datasetId],
    queryFn: () => analysisService.list(),
    enabled: !!datasetId,
  });

  // Mutation for creating analysis
  const {
    mutate: createAnalysis,
    isPending: isCreating,
    error: createError,
  } = useMutation({
    mutationFn: (request: AnalysisRequest) => analysisService.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses', datasetId] });
    },
  });

  // Query for getting analysis results
  const getAnalysisResults = (
    analysisType: AnalysisType,
    config: AnalysisConfig
  ) => {
    return useQuery({
      queryKey: ['analysisResults', datasetId, analysisType, config],
      queryFn: () => analysisService.getResults(datasetId!, analysisType, config),
      enabled: !!datasetId,
    });
  };

  // Mutation for deleting analysis
  const {
    mutate: deleteAnalysis,
    isPending: isDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: (analysisId: string) => analysisService.delete(analysisId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses', datasetId] });
    },
  });

  const runAnalysis = (type: AnalysisType, config: AnalysisConfig) => {
    if (!datasetId) return;

    createAnalysis({
      dataset_id: datasetId,
      analysis_type: type,
      config,
    });
  };

  return {
    // Data
    analyses,

    // Loading states
    isLoadingAnalyses,
    isCreating,
    isDeleting,

    // Errors
    analysesError,
    createError,
    deleteError,

    // Actions
    runAnalysis,
    deleteAnalysis,
    getAnalysisResults,
  };
}; 