export type TraceEntry = {
  line_number: number;
  locals: Record<string, any>;
  delta: Record<string, any>;
  eval_result?: any;
};

export type TraceData = {
  metadata: {
    code: string;
    function: string;
    inputs: {
      kwargs: Record<string, string>;
    };
  };
  trace: Array<TraceEntry>;
  result: any;
};
