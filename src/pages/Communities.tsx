import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Search, UserPlus, UserMinus } from "lucide-react";

const Communities = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [communities, setCommunities] = useState<any[]>([]);
  const [userCommunities, setUserCommunities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setCurrentUser(user);

      // Fetch all communities
      const { data: communitiesData } = await supabase
        .from("communities")
        .select("*")
        .order("member_count", { ascending: false });

      setCommunities(communitiesData || []);

      // Fetch user's communities
      const { data: userCommData } = await supabase
        .from("user_communities")
        .select("community_id")
        .eq("user_id", user.id);

      setUserCommunities(userCommData?.map(uc => uc.community_id) || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (communityId: string) => {
    try {
      const { error } = await supabase
        .from("user_communities")
        .insert({
          user_id: currentUser.id,
          community_id: communityId,
        });

      if (error) throw error;

      // Update member count
      const community = communities.find(c => c.id === communityId);
      await supabase
        .from("communities")
        .update({ member_count: (community?.member_count || 0) + 1 })
        .eq("id", communityId);

      toast({
        title: "Joined community!",
        description: "You are now a member of this community",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error joining community",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLeave = async (communityId: string) => {
    try {
      const { error } = await supabase
        .from("user_communities")
        .delete()
        .eq("user_id", currentUser.id)
        .eq("community_id", communityId);

      if (error) throw error;

      // Update member count
      const community = communities.find(c => c.id === communityId);
      await supabase
        .from("communities")
        .update({ member_count: Math.max(0, (community?.member_count || 0) - 1) })
        .eq("id", communityId);

      toast({
        title: "Left community",
        description: "You have left this community",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error leaving community",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredCommunities = communities.filter(c =>
    searchQuery === "" ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Communities</h1>
          <p className="text-muted-foreground text-lg">
            Connect with people who share your interests
          </p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredCommunities.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No communities found</h3>
              <p className="text-muted-foreground">Try adjusting your search</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community) => {
              const isMember = userCommunities.includes(community.id);
              
              return (
                <Card key={community.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      {community.icon_url ? (
                        <img src={community.icon_url} alt="" className="h-12 w-12 rounded-full" />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl font-bold">
                          {community.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-lg">{community.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          <Users className="h-3 w-3 mr-1" />
                          {community.member_count} members
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription className="line-clamp-3">
                      {community.description || "No description available"}
                    </CardDescription>
                  </CardContent>
                  
                  <CardFooter>
                    {isMember ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleLeave(community.id)}
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Leave
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleJoin(community.id)}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Join
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Communities;
