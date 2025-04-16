import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import ComparisonTool from "@/components/comparison/ComparisonTool";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { ExternalLink, Scale, Loader2, BookOpen, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

const Research = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [initialQuery, setInitialQuery] = useState<string | null>(null);
  
  useEffect(() => {
    if (location.state && location.state.initialQuery) {
      setInitialQuery(location.state.initialQuery);
    }
    
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAuthenticated(false);
          navigate("/login");
          toast.error("Please sign in to access research tools");
          return;
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Authentication check failed:", error);
        navigate("/login");
        toast.error("Authentication error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          navigate("/login");
        } else if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location]);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      navigate("/");
      toast.success("You have been logged out");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Verifying authentication...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      
      <main className="flex-1 container py-8">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Scale className="h-8 w-8 mr-2 text-primary" />
                Legal Research Assistant
              </h1>
              <p className="text-muted-foreground mt-1">
                Compare legal principles using our advanced case law database
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/library")}>
                <BookOpen className="h-4 w-4 mr-1" />
                Your Library
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://www.law.cornell.edu/" target="_blank" rel="noreferrer" className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Legal Resources
                </a>
              </Button>
            </div>
          </div>
          
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Enhanced Legal Database</h3>
                  <p className="text-muted-foreground">
                    Our system analyzes your queries using a comprehensive database of legal principles and cases
                    across multiple domains including property law, contract law, tort law, constitutional law, and criminal law.
                  </p>
                  <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <li className="flex items-center text-sm">
                      <span className="text-primary mr-2">•</span> 
                      Leading case law precedents
                    </li>
                    <li className="flex items-center text-sm">
                      <span className="text-primary mr-2">•</span> 
                      Key legal principles
                    </li>
                    <li className="flex items-center text-sm">
                      <span className="text-primary mr-2">•</span> 
                      Comparative analysis
                    </li>
                    <li className="flex items-center text-sm">
                      <span className="text-primary mr-2">•</span> 
                      Customized recommendations
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <ComparisonTool initialQuery={initialQuery} />
        </div>
      </main>
      
      <footer className="border-t bg-muted/50">
        <div className="container flex flex-col gap-2 sm:flex-row py-6 w-full items-center justify-between">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 LegalAssist. All rights reserved.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            For educational purposes only. Not legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Research;
