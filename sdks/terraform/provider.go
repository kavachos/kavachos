package main

import (
	"context"
	"os"

	"github.com/hashicorp/terraform-plugin-sdk/v2/diag"
	"github.com/hashicorp/terraform-plugin-sdk/v2/helper/schema"
	kavachos "github.com/kavachos/kavachos-go"
)

// providerConfig holds the configured KavachOS client shared across all resources.
type providerConfig struct {
	// client is the typed Go SDK client used for agents, audit, and delegation.
	client *kavachos.Client
	// http is a minimal HTTP client for endpoints not yet in the Go SDK (API keys, orgs).
	http *httpClient
}

// New returns the provider factory function used by plugin.Serve.
func New() *schema.Provider {
	return &schema.Provider{
		Schema: map[string]*schema.Schema{
			"base_url": {
				Type:        schema.TypeString,
				Required:    true,
				DefaultFunc: schema.EnvDefaultFunc("KAVACHOS_BASE_URL", nil),
				Description: "Base URL of your KavachOS deployment, e.g. https://your-app.com/api/kavach. " +
					"Can also be set via the KAVACHOS_BASE_URL environment variable.",
			},
			"token": {
				Type:        schema.TypeString,
				Required:    true,
				Sensitive:   true,
				DefaultFunc: schema.EnvDefaultFunc("KAVACHOS_TOKEN", nil),
				Description: "API token for authenticating with KavachOS. " +
					"Can also be set via the KAVACHOS_TOKEN environment variable.",
			},
		},

		ResourcesMap: map[string]*schema.Resource{
			"kavachos_agent":        resourceAgent(),
			"kavachos_permission":   resourcePermission(),
			"kavachos_api_key":      resourceAPIKey(),
			"kavachos_organization": resourceOrganization(),
		},

		DataSourcesMap: map[string]*schema.Resource{
			"kavachos_agent":  dataSourceAgent(),
			"kavachos_agents": dataSourceAgents(),
		},

		ConfigureContextFunc: providerConfigure,
	}
}

func providerConfigure(_ context.Context, d *schema.ResourceData) (interface{}, diag.Diagnostics) {
	var diags diag.Diagnostics

	baseURL := d.Get("base_url").(string)
	if baseURL == "" {
		baseURL = os.Getenv("KAVACHOS_BASE_URL")
	}
	if baseURL == "" {
		diags = append(diags, diag.Diagnostic{
			Severity: diag.Error,
			Summary:  "Missing base_url",
			Detail:   "base_url must be set in provider configuration or via KAVACHOS_BASE_URL.",
		})
		return nil, diags
	}

	token := d.Get("token").(string)
	if token == "" {
		token = os.Getenv("KAVACHOS_TOKEN")
	}
	if token == "" {
		diags = append(diags, diag.Diagnostic{
			Severity: diag.Error,
			Summary:  "Missing token",
			Detail:   "token must be set in provider configuration or via KAVACHOS_TOKEN.",
		})
		return nil, diags
	}

	client := kavachos.NewClient(baseURL, kavachos.WithToken(token))
	rawClient := newHTTPClient(baseURL, token)

	return &providerConfig{client: client, http: rawClient}, diags
}
