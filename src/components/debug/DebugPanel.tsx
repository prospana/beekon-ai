import { useState } from 'react';
import { useDebug } from '@/utils/debug';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X, Download, Trash2, Bug, Activity, Network, Database } from 'lucide-react';

export const DebugPanel = () => {
  const { state, actions } = useDebug();
  const [activeTab, setActiveTab] = useState('logs');

  if (!state.isDebugMode || !state.showDebugPanel) {
    return null;
  }

  const handleDownloadLogs = () => {
    const logData = JSON.stringify(state.logs, null, 2);
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-500';
      case 'warn':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      case 'debug':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Debug Panel
            </CardTitle>
            <CardDescription>
              Development debugging tools and monitoring
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadLogs}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={actions.clearLogs}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.toggleDebugPanel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <Bug className="h-4 w-4" />
                Logs ({state.logs.length})
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="network" className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                Network ({state.network.requests.length})
              </TabsTrigger>
              <TabsTrigger value="supabase" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Supabase ({state.supabase.queries.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="logs" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {state.logs.map((log, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                      <div className={`w-2 h-2 rounded-full ${getLevelColor(log.level)} mt-2`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline">{log.level}</Badge>
                          <span className="text-muted-foreground">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                          {log.context && (
                            <Badge variant="secondary">{log.context}</Badge>
                          )}
                        </div>
                        <p className="text-sm mt-1">{log.message}</p>
                        {log.data && (
                          <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="performance" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Renders</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{state.performance.renderCount}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Last Render</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {state.performance.lastRenderTime > 0 
                            ? new Date(state.performance.lastRenderTime).toLocaleTimeString()
                            : 'N/A'
                          }
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold mb-2">Component Mounts</h3>
                    <div className="space-y-2">
                      {Object.entries(state.performance.componentMounts).map(([component, count]) => (
                        <div key={component} className="flex justify-between items-center">
                          <span className="text-sm">{component}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold mb-2">API Calls</h3>
                    <div className="space-y-2">
                      {Object.entries(state.performance.apiCalls).map(([name, stats]) => (
                        <div key={name} className="flex justify-between items-center">
                          <span className="text-sm">{name}</span>
                          <div className="flex gap-2">
                            <Badge variant="outline">{stats.count} calls</Badge>
                            <Badge variant="outline">{stats.averageTime.toFixed(2)}ms avg</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="network" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {state.network.requests.map((request) => (
                    <div key={request.id} className="p-2 rounded-md bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{request.method}</Badge>
                          <span className="text-sm font-mono">{request.url}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {request.status && (
                            <Badge variant={request.status >= 400 ? 'destructive' : 'default'}>
                              {request.status}
                            </Badge>
                          )}
                          {request.duration && (
                            <Badge variant="secondary">{request.duration}ms</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {request.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="supabase" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {state.supabase.queries.map((query) => (
                    <div key={query.id} className="p-2 rounded-md bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{query.operation}</Badge>
                          <span className="text-sm font-mono">{query.table}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {query.error && (
                            <Badge variant="destructive">Error</Badge>
                          )}
                          {query.duration && (
                            <Badge variant="secondary">{query.duration}ms</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {query.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      {query.error && (
                        <p className="text-sm text-red-500 mt-1">{query.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};