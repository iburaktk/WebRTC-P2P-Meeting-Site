// using Oracle.ManagedDataAccess.Client;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run( 
    /*
    async (context) =>
{
    Console.WriteLine("Started");
    string connectionString = "User Id=SYS;Password={pass};Data Source=localhost:1521/XEPDB1";
    OracleConnection connection = new OracleConnection(connectionString);
    OracleCommand command = connection.CreateCommand();
    try
    {
        connection.Open();
        command.BindByName = true;
        command.CommandText = "select :myParameter from user_tables;";
        OracleParameter myParameter = new OracleParameter("myParameter", "*");
        command.Parameters.Add(myParameter);
        OracleDataReader reader = command.ExecuteReader();
        while (reader.Read())
        {
            Console.WriteLine(reader.GetString(0));
            await context.Response.WriteAsync(reader.GetString(0));
        }
        reader.Dispose();
        Console.WriteLine("The end");
        Thread.Sleep(500000);
    }
    catch (Exception ex)
    {
        Console.WriteLine("Error: " + ex.Message);
        await context.Response.WriteAsync(ex.Message);
    }
}
*/
);
