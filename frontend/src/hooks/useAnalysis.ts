import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analysisService } from '../api/services';
import {
  Analysis,
  AnalysisRequest,
  AnalysisType,
  AnalysisConfig,
  AnalysisResponse,
} from '../types/analysis';

// Separate hook for analysis status
export const useAnalysisStatus = (analysisId: number) => {
  return useQuery<AnalysisResponse>({
    queryKey: ['analysis', analysisId],
    queryFn: () => analysisService.getAnalysis(analysisId),
    refetchInterval: (query) => 
      query.data?.status === 'pending' || query.data?.status === 'processing' ? 2000 : false,
    enabled: !!analysisId,
  });
};

export const useAnalysis = (datasetId?: string) => {
  const queryClient = useQueryClient();

  // Query for listing analyses - disabled by default
  const {
    data: analyses,
    isLoading: isLoadingAnalyses,
    error: analysesError,
  } = useQuery({
    queryKey: ['analyses', datasetId],
    queryFn: () => analysisService.list(),
    enabled: false,  // Disable automatic fetching
  });

  // Mutation for creating analysis
  const {
    mutateAsync: createAnalysis,
    isPending: isCreating,
    error: createError,
  } = useMutation({
    mutationFn: (request: AnalysisRequest) => analysisService.create(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['analysis', data.id] });
    },
  });

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

  const runAnalysis = async (type: AnalysisType, config: AnalysisConfig) => {
    if (!datasetId) return;

    const response = await createAnalysis({
      dataset_id: parseInt(datasetId),
      analysis_type: type,
      config
    });

    return response;
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
  };
}; 