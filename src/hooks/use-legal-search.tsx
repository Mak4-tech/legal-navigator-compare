
import { useState } from "react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export const useLegalSearch = (initialQuery: string | null = null) => {
  const [query, setQuery] = useState<string>(initialQuery || "");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<any | null>(null);
  const [jurisdiction, setJurisdiction] = useState<string>("general");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error("Please enter a legal query to analyze.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('legal-search', {
        body: { 
          query: jurisdiction === "zambian" ? `Zambian law: ${query}` : query
        }
      });
      
      if (error) throw error;
      
      // Always save the search in history when successful
      if (session?.user) {
        try {
          await supabase.from('search_history').insert({
            query: `${jurisdiction === "zambian" ? "[Zambian] " : ""}${query}`,
            user_id: session.user.id,
            results_count: data.comparison.commonLaw.caseExamples.length + 
                          data.comparison.contractLaw.caseExamples.length
          });
        } catch (historyError) {
          console.error("Failed to save search history:", historyError);
        }
      }
      
      setResults(data);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Analysis failed. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    query,
    setQuery,
    isLoading,
    results,
    jurisdiction,
    setJurisdiction,
    handleSearch
  };
};
