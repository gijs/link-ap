text/bulletpoints+plain

 - the user agent
   - is loaded first
   - organizes program agents in the document
 - program agents
   - adopt behaviors from program resources
   - decide how responses should be interpreted
 - all agents
   - serve resource interfaces
   - can be replaced

---

text/metaphor+plain

The user agent is a stage. It creates the world for actors to create stories. The actors (program agents) take on characters and improvise with the scripts they receive. Sometimes the script says to take on a new character; sometimes the script says to speak new words or take new actions. Together, they create stories directed by the user.

--

text/intentions+plain

This system is designed to compose program behavior through a set of interpretive layers. The user agent is like a windowing manager, but it's not constrained to that style of behavior. It could, for instance, create a game world for program agents to act as characters and scenery. You might say it sets the mode of behavior for the document; a productivity-focused UA would organize for consistency, while a creativity-focused UA would try to enable cooperation between program agents to create composite interfaces.

The program agents work with the UA and resource responses to create representations. They are an individual behavior, but they let the UA direct it into group behavior. This means they shouldn't be compatible with all user agents, but should work within a certain class of them. (How would an NPC PA work in a productivity UA anyway?)

---

text/mechanics+plain

The program agents exist to interpret the responses to Web requests made by the user. They listen for a "response" event, then decide how the data should be handled. If they don't have an opinion and are happy to change behaviors, they can run the default handler: replace the entire agent with the response. That replacement can then hook into the "response" event and start interpreting on its own.

User requests are created by the UA (which listens to DOM events or, as in linkshui, a CLI to create the requests). The responses are then passed to the agents' "response" handlers. If, for instance, the response body is recognizable JSON, then the agent can populate itself with that data.

The handler code can choose to issue requests throw the agent, as if on behalf of the user. The only difference is the use of the UA pipeline; a request could be made directly using LinkJS and handled using custom handlers. This is useful for issuing pre-configured requests, e.g. to do the initial population.